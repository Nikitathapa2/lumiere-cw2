// Collections shown as homepage cards (§3.1) and the Collections listing hero (§3.2).
const hero = (seed) => `https://picsum.photos/seed/lumiere-col-${seed}/1200/1500`;

export const collections = [
  {
    slug: 'minimalist-essentials',
    title: 'Minimalist Essentials',
    kicker: 'NEW COLLECTION',
    description: 'Foundational pieces in pure form — the quiet backbone of a considered wardrobe.',
    heroImage: hero('minimalist'),
    productSlugs: ['white-tshirt', 'white-hoodie', 'denim-pant'],
    featured: true,
    order: 1,
  },
  {
    slug: 'urban-edit',
    title: 'Urban Edit',
    kicker: 'NEW COLLECTION',
    description: 'Sharp tailoring and architectural outerwear for the modern city.',
    heroImage: hero('urban'),
    productSlugs: ['casual-jeans', 'women-s-blazer', 'vans-old-school-sneaker', 'running-sneakers'],
    featured: true,
    order: 2,
  },
  {
    slug: 'evening-wear',
    title: 'Evening Wear',
    kicker: 'NEW COLLECTION',
    description: 'Fluid silhouettes that catch the light — refined dressing after dark.',
    heroImage: hero('evening'),
    productSlugs: ['floral-summer-dress', 'women-s-blazer', 'leather-handbag'],
    featured: true,
    order: 3,
  },
  {
    slug: 'aw-2024',
    title: 'Autumn/Winter 2024',
    kicker: 'LIMITED EDITION',
    description:
      'A curated dialogue between structure and fluidity. Exploring the tactile nature of cold-weather silhouettes through raw silk, heavy knits, and architectural outerwear.',
    heroImage: hero('aw-2024'),
    productSlugs: [
      'white-hoodie',
      'women-s-blazer',
      'denim-pant',
      'casual-jeans',
      'leather-handbag',
      'semi-digital-watch',
    ],
    featured: false,
    order: 4,
  },
];
