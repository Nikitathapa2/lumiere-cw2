import mongoose from 'mongoose';

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    title: { type: String, required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    ancestors: { type: [{ _id: Schema.Types.ObjectId, slug: String, title: String }], default: [] },
    path: { type: String, required: true, index: true },
    priority: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
    type: { type: String, enum: ['category', 'collection'], default: 'category' },
    meta: { description: { type: String, default: '' }, imageUrl: { type: String, default: '' } },
  },
  { timestamps: true }
);

export const Category = mongoose.model('Category', categorySchema);
