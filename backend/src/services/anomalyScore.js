import { AuditLog } from '../models/AuditLog.js';


export async function loginAnomalyScore(userId) {
  try {
    const recentLogins = await AuditLog.find({ type: 'auth.login', userId })
      .sort({ seq: -1 })
      .limit(60)
      .select('createdAt')
      .lean();

    if (recentLogins.length < 5) {
      return { score: 0, unusual: false, historySize: recentLogins.length };
    }

    const hours = recentLogins.map((e) => new Date(e.createdAt).getUTCHours());
    const mean = hours.reduce((a, b) => a + b, 0) / hours.length;
    const variance = hours.reduce((a, h) => a + (h - mean) ** 2, 0) / hours.length;
    const stdDev = Math.sqrt(variance);

    const currentHour = new Date().getUTCHours();

    const score = stdDev < 0.01 ? (currentHour === Math.round(mean) ? 0 : 99) : Math.abs(currentHour - mean) / stdDev;

    return {
      score: Math.round(score * 100) / 100,
      hour: currentHour,
      mean: Math.round(mean * 10) / 10,
      stdDev: Math.round(stdDev * 10) / 10,
      unusual: score > 2,
      historySize: recentLogins.length,
    };
  } catch {
    return { score: 0, unusual: false };
  }
}
