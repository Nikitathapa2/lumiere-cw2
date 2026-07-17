import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { enforcePasswordPolicy, enforcePasswordHistory, rotatePasswordHistory } from '../utils/passwordPolicy.js';
import { logEvent } from '../services/audit.js';
import { pick } from '../utils/pick.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// PATCH /api/auth/me — update profile fields (protected).
export const updateProfile = asyncHandler(async (req, res) => {
  // Mass-assignment guard: a user may only edit these four fields — never role,
  // newsletter-bypass, or any privileged flag.
  const { firstName, lastName, email, newsletter } = pick(req.body, [
    'firstName', 'lastName', 'email', 'newsletter',
  ]);
  const user = req.user;

  if (email && typeof email === 'string' && email.toLowerCase() !== user.email) {
    if (!EMAIL_RE.test(email)) {
      res.status(400);
      throw new Error('Please enter a valid email address.');
    }
    const taken = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
    if (taken) {
      res.status(409);
      throw new Error('That email is already in use.');
    }
    user.email = email.toLowerCase();
  }

  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (newsletter !== undefined) user.newsletter = Boolean(newsletter);

  await user.save();
  res.json({ user });
});

// POST /api/auth/change-password (protected + step-up required).
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide your current and new password.');
  }

  const user = await User.findById(req.user._id).select('+passwordHash +passwordHistory');
  if (!(await user.comparePassword(currentPassword))) {
    res.status(401);
    throw new Error('Your current password is incorrect.');
  }

  await enforcePasswordPolicy(newPassword);
  await enforcePasswordHistory(newPassword, user.passwordHistory);

  rotatePasswordHistory(user);
  await user.setPassword(newPassword);
  await user.save();

  await logEvent({ userId: user._id, type: 'auth.password_changed', ip: req.ip, ua: req.headers['user-agent'] });

  res.json({ message: 'Password updated.' });
});

const REQUIRED = ['firstName', 'lastName', 'address', 'city', 'postalCode', 'country'];

function validateAddress(body, res) {
  const missing = REQUIRED.filter((f) => !body?.[f]?.toString().trim());
  if (missing.length) {
    res.status(400);
    throw new Error(`Missing address fields: ${missing.join(', ')}`);
  }
}

function findAddr(addresses, addrId) {
  return (addresses ?? []).findIndex((a) => String(a._id) === String(addrId));
}

// GET /api/auth/addresses
export const listAddresses = asyncHandler(async (req, res) => {
  res.json({ addresses: req.user.addresses ?? [] });
});

// POST /api/auth/addresses
export const addAddress = asyncHandler(async (req, res) => {
  validateAddress(req.body, res);
  const user = req.user;
  const current = user.addresses ?? [];
  const makeDefault = Boolean(req.body.isDefault) || current.length === 0;

  const newAddr = {
    _id: new mongoose.Types.ObjectId().toHexString(),
    ...pickAddress(req.body),
    isDefault: makeDefault,
  };

  user.addresses = makeDefault
    ? [...current.map((a) => ({ ...a, isDefault: false })), newAddr]
    : [...current, newAddr];

  await user.save();
  res.status(201).json({ addresses: user.addresses });
});

// PATCH /api/auth/addresses/:addrId
export const updateAddress = asyncHandler(async (req, res) => {
  const user = req.user;
  const current = user.addresses ?? [];
  const idx = findAddr(current, req.params.addrId);

  if (idx === -1) {
    res.status(404);
    throw new Error('Address not found.');
  }

  const updated = { ...current[idx], ...pickAddress(req.body) };
  let next;

  if (req.body.isDefault) {
    // Clear isDefault on all, then set on the updated entry
    next = current.map((a, i) => ({ ...a, isDefault: false }));
    next[idx] = { ...updated, isDefault: true };
  } else {
    next = current.map((a, i) => (i === idx ? updated : a));
  }

  user.addresses = next;
  await user.save();
  res.json({ addresses: user.addresses });
});

// DELETE /api/auth/addresses/:addrId
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = req.user;
  const current = user.addresses ?? [];
  const idx = findAddr(current, req.params.addrId);

  if (idx === -1) {
    res.status(404);
    throw new Error('Address not found.');
  }

  const wasDefault = current[idx].isDefault;
  let next = current.filter((_, i) => i !== idx);

  if (wasDefault && next.length) {
    next = [{ ...next[0], isDefault: true }, ...next.slice(1)];
  }

  user.addresses = next;
  await user.save();
  res.json({ addresses: user.addresses });
});

// Mass-assignment guard: an address may only ever carry these six fields, so a
// client can't inject e.g. isDefault:true on a sibling or an unexpected key.
function pickAddress(b) {
  return { ...pick(b, REQUIRED) };
}
