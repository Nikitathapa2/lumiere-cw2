import mongoose from 'mongoose';

const { Schema } = mongoose;

const WINDOW_SECONDS = 900;

const loginAttemptSchema = new Schema({
  accountHash: { type: String, required: true, index: true },
  ip: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

loginAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: WINDOW_SECONDS });

export const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema);
export { WINDOW_SECONDS };
