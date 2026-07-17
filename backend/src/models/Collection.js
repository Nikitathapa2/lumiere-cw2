import mongoose from 'mongoose';

const { Schema } = mongoose;

const collectionSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    title: { type: String, required: true },
    kicker: { type: String, default: '' },
    description: { type: String, default: '' },
    heroImage: { type: String, default: '' },
    productSlugs: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Collection = mongoose.model('Collection', collectionSchema);
