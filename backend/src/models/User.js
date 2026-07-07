import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { fieldEncryptionPlugin } from '../utils/fieldEncryption.js';

const { Schema } = mongoose;

const passwordHistorySchema = new Schema({
  hash: { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
});

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: {
      type: String,
      select: false,
      required() {
        return this.authProvider === 'local';
      },
    },
    newsletter: { type: Boolean, default: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    wishlist: { type: [String], default: [] },

    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, default: null, index: true, sparse: true },

    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String, default: null, select: false },
    mfaRecoveryCodes: { type: [String], default: [], select: false },

    resetPasswordToken: { type: String, default: null, select: false },
    resetPasswordExpires: { type: Date, default: null, select: false },

    passwordHistory: { type: [passwordHistorySchema], default: [], select: false },

    lockedUntil: { type: Date, default: null, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.plugin(fieldEncryptionPlugin, { fields: ['addresses'] });

// ── Helpers ───────────────────────────────────────────────────────────────────

userSchema.methods.setPassword = async function setPassword(plain) {
  this.passwordHash = await bcrypt.hash(plain, 12);
};

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret._addressesEnc;
    delete ret.mfaSecret;
    delete ret.mfaRecoveryCodes;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    delete ret.passwordHistory;
    delete ret.lockedUntil;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
