export const CATEGORY_LABELS = {
  mens: 'Men',
  womens: 'Women',
  kids: 'Kids',
  footwear: 'Footwear',
  accessories: 'Accessories',
  fragrance: 'Fragrance',
  outerwear: 'Outerwear',
  knitwear: 'Knitwear',
  dresses: 'Dresses',
  trousers: 'Trousers',
};

export function categoryLabel(slug) {
  return CATEGORY_LABELS[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}
