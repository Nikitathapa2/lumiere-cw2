import mongoose from 'mongoose';

const { Schema } = mongoose;

const auditEventSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    type: { type: String, required: true, index: true },
    ip: { type: String, default: null },
    ua: { type: String, default: null },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const AuditEvent = mongoose.model('AuditEvent', auditEventSchema);
