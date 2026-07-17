import mongoose from 'mongoose';

const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },

    customerEmail: { type: String, default: null },
    customerName: { type: String, default: null },

    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },

    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },

    provider: { type: String, enum: ['stripe', 'mock'], default: 'stripe' },

    stripeSessionId: { type: String, default: null },
    paymentIntentId: { type: String, default: null },

    orderNumber: { type: String, default: null },
    paidAt: { type: Date, default: null },
    failureReason: { type: String, default: null },
  },
  { timestamps: true }
);

transactionSchema.index(
  { stripeSessionId: 1 },
  { unique: true, partialFilterExpression: { stripeSessionId: { $type: 'string' } } }
);

export const Transaction = mongoose.model('Transaction', transactionSchema);
