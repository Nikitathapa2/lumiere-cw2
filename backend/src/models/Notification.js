import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'order_placed',
        'order_processing',
        'order_shipped',
        'order_delivered',
        'order_cancelled',
        'system',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', default: null },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
