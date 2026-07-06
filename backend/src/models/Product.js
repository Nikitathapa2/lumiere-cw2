import mongoose from 'mongoose';

const { Schema } = mongoose;

const colorSchema = new Schema(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },

    category: {
      type: String,
      required: true,
      enum: [
        'outerwear',
        'knitwear',
        'dresses',
        'trousers',
        'accessories',
        'footwear',
        'fragrance',
        'mens',
        'womens',
        'kids',
      ],
      index: true,
    },
    subcategory: { type: String, default: '' },

    subLabel: { type: String, default: '' },

    sizes: { type: [String], default: [] },
    colors: { type: [colorSchema], default: [] },
    images: { type: [String], default: [] },

    material: { type: [String], default: [] },
    careLines: { type: [String], default: [] },

    originalPrice: { type: Number, default: null },

    inStock: { type: Boolean, default: true },
    stockBySize: { type: Map, of: Number, default: {} },

    isNewArrival: { type: Boolean, default: false, index: true },
    collectionTags: { type: [String], default: [] },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', subLabel: 'text' });

export const Product = mongoose.model('Product', productSchema);
