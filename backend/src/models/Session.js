import mongoose from 'mongoose';

const { Schema } = mongoose;

const sessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jti: { type: String, required: true, unique: true, index: true },

    deviceHash: { type: String, required: true },
    uaHash: { type: String, required: true },
    ipPrefix: { type: String, default: '' },

    userAgent: { type: String, default: '' },

    lastSeenAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },

    stepUpAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Session = mongoose.model('Session', sessionSchema);
