import { AuditLog } from '../models/AuditLog.js';
import { env } from '../config/env.js';

const THROTTLE_MS = 10 * 60 * 1000;
const lastFired = new Map();

function shouldFire(key) {
  const last = lastFired.get(key);
  if (!last || Date.now() - last > THROTTLE_MS) return true;
  return false;
}

function markFired(key) {
  lastFired.set(key, Date.now());
}

async function sendAlertEmail(alert) {
  if (!env.alertEmail) return;
  try {
    const { sendSecurityAlertEmail } = await import('./emailService.js');
    await sendSecurityAlertEmail({ alert });
  } catch (err) {
    console.error('[alerting] email sink failed:', err.message);
  }
}

async function sendAlertWebhook(alert) {
  if (!env.alertWebhookUrl) return;
  try {
    const body = JSON.stringify({
      text: `🚨 [LUMIÈRE Security] ${alert.severity} — ${alert.title}`,
      alert,
    });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    await fetch(env.alertWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: ctrl.signal,
    });
    clearTimeout(timer);
  } catch (err) {
    console.error('[alerting] webhook sink failed:', err.message);
  }
}

async function fire(alert) {
  const key = `${alert.rule}:${alert.key}`;
  if (!shouldFire(key)) return;
  markFired(key);

  console.warn(`[SECURITY ALERT] ${alert.severity} ${alert.rule} — ${alert.title}`);
  await Promise.allSettled([sendAlertEmail(alert), sendAlertWebhook(alert)]);
}

async function checkFailedLoginSpikeAccount(event) {
  if (event.type !== 'auth.login_failed' || !event.userId) return;
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const count = await AuditLog.countDocuments({
    type: 'auth.login_failed',
    userId: event.userId,
    createdAt: { $gte: since },
  });
  if (count >= 5) {
    await fire({
      rule: 'failed_login_spike_account',
      key: String(event.userId),
      severity: 'HIGH',
      title: `Account brute-force detected (${count} failures in 15 min)`,
      meta: { userId: String(event.userId), count, windowMinutes: 15 },
    });
  }
}

async function checkFailedLoginSpikeIP(event) {
  if (event.type !== 'auth.login_failed' || !event.ip) return;
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const count = await AuditLog.countDocuments({
    type: 'auth.login_failed',
    ip: event.ip,
    createdAt: { $gte: since },
  });
  if (count >= 10) {
    await fire({
      rule: 'failed_login_spike_ip',
      key: event.ip,
      severity: 'HIGH',
      title: `IP spray attack detected (${count} failures from ${event.ip} in 15 min)`,
      meta: { ip: event.ip, count, windowMinutes: 15 },
    });
  }
}

async function checkRoleEscalation(event) {
  if (event.type !== 'admin.role_changed') return;
  if (event.meta?.newRole !== 'admin') return;
  await fire({
    rule: 'role_escalation',
    key: String(event.meta?.targetUserId ?? 'unknown'),
    severity: 'CRITICAL',
    title: `User promoted to admin by ${event.meta?.by ?? 'unknown'}`,
    meta: event.meta,
  });
}

async function checkImpossibleTravel(event) {
  if (event.type !== 'auth.login' || !event.userId || !event.ip) return;
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recentLogin = await AuditLog.findOne({
    type: 'auth.login',
    userId: event.userId,
    ip: { $ne: event.ip },
    createdAt: { $gte: since },
  })
    .sort({ seq: -1 })
    .lean();

  if (recentLogin) {
    await fire({
      rule: 'impossible_travel',
      key: String(event.userId),
      severity: 'HIGH',
      title: 'Impossible travel detected — login from two different IP prefixes within 1 hour',
      meta: {
        userId: String(event.userId),
        previousIp: recentLogin.ip,
        currentIp: event.ip,
        previousLoginAt: recentLogin.createdAt,
      },
    });
  }
}

async function checkLoginAnomaly(event) {
  if (event.type !== 'auth.login' || !event.userId) return;
  const { loginAnomalyScore } = await import('./anomalyScore.js');
  const result = await loginAnomalyScore(event.userId);
  if (result.unusual) {
    await fire({
      rule: 'login_time_anomaly',
      key: String(event.userId),
      severity: 'MEDIUM',
      title: `Unusual login time detected (z-score ${result.score}, hour ${result.hour} vs. mean ${result.mean})`,
      meta: { userId: String(event.userId), ...result },
    });
  }
}


export async function runAlertRules(event) {
  try {
    await Promise.allSettled([
      checkFailedLoginSpikeAccount(event),
      checkFailedLoginSpikeIP(event),
      checkRoleEscalation(event),
      checkImpossibleTravel(event),
      checkLoginAnomaly(event),
    ]);
  } catch (err) {
    console.error('[alerting] runAlertRules fatal:', err.message);
  }
}
