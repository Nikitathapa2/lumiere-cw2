import path from 'path';
import { PRODUCT_IMAGE_MANIFEST } from './seedImages.js';

const APPAREL = ['XS', 'S', 'M', 'L', 'XL'];
const EU_SHOES = ['40', '41', '42', '43', '44'];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

const _usedSlugs = new Map();
function uniqueSlug(name) {
  const base = slugify(name);
  if (!_usedSlugs.has(base)) {
    _usedSlugs.set(base, 1);
    return base;
  }
  const n = _usedSlugs.get(base) + 1;
  _usedSlugs.set(base, n);
  return `${base}-${n}`;
}

function guessCategory(filename) {
  const s = filename.toLowerCase();
  if (s.includes('women') || s.includes("women's") || s.includes('dress') || s.includes('floral')) return 'womens';
  if (s.includes('kids')) return 'kids';
  if (s.includes('sneak') || s.includes('running') || s.includes('vans')) return 'footwear';
  if (s.includes('handbag') || s.includes('watch')) return 'accessories';
  return 'mens';
}

function defaultPriceForCategory(cat) {
  switch (cat) {
    case 'footwear':
      return 120;
    case 'accessories':
      return 85;
    case 'kids':
      return 30;
    case 'womens':
    case 'mens':
    default:
      return 95;
  }
}

export const products = PRODUCT_IMAGE_MANIFEST.map(({ original, url }, idx) => {
  const name = path.basename(original, path.extname(original));
  const category = guessCategory(name);
  const price = defaultPriceForCategory(category);
  const slug = uniqueSlug(name);
  const onSale = idx % 5 === 0 || idx % 7 === 0;
  const originalPrice = onSale ? Math.round((price * 1.35) / 5) * 5 : null;

  return {
    slug,
    name,
    description: `${name} — curated product from your uploaded assets.`,
    price,
    category,
    subcategory: '',
    subLabel: '',
    sizes: category === 'footwear' ? EU_SHOES : category === 'accessories' ? [] : APPAREL,
    colors: [],
    images: [url],
    material: [],
    careLines: [],
    originalPrice,
    inStock: true,
    isNewArrival: idx % 8 === 0,
    collectionTags: [],
  };
});
