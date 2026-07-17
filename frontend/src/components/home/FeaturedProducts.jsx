import ProductImage from '@/components/ui/ProductImage';

const DEFAULT_PRODUCTS = [
  {
    id: '1',
    name: 'Architectural Trench Coat',
    price: '$450.00',
    rating: '4.9',
    badge: 'New',
    imageSrc: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80',
    imageAlt: 'Architectural Trench Coat',
    href: '/products/architectural-trench-coat',
  },
  {
    id: '2',
    name: 'Fluid Silk Blouse',
    price: '$280.00',
    rating: '4.8',
    imageSrc: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&q=80',
    imageAlt: 'Fluid Silk Blouse',
    href: '/products/fluid-silk-blouse',
  },
  {
    id: '3',
    name: 'Peak Lapel Wool Blazer',
    price: '$395.00',
    rating: '5.0',
    imageSrc: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80',
    imageAlt: 'Peak Lapel Wool Blazer',
    href: '/products/peak-lapel-wool-blazer',
  },
  {
    id: '4',
    name: 'Noir Leather Crossbody',
    price: '$195.00',
    rating: '4.7',
    imageSrc: 'https://images.unsplash.com/photo-1584917865442-de89be144b2c?w=600&q=80',
    imageAlt: 'Noir Leather Crossbody',
    href: '/products/noir-leather-crossbody',
  },
];

/**
 * @param {{ products?: typeof DEFAULT_PRODUCTS }} props
 */
export default function FeaturedProducts({ products = DEFAULT_PRODUCTS }) {
  const items = products.length ? products : DEFAULT_PRODUCTS;

  return (
    <section className="bg-surface-container-low py-section-desktop">
      <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-widest mb-2 block">
              Our Favorites
            </span>
            <h2 className="font-headline-lg text-headline-lg">Featured Products</h2>
          </div>
          <a
            href="/shop"
            className="font-label-lg text-label-lg text-primary border-b border-primary pb-1"
          >
            View All Products
          </a>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-gutter gap-y-12">
          {items.map((product) => (
            <div key={product.id} className="group">
              <a href={product.href} className="relative overflow-hidden mb-4 bg-white block">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <ProductImage
                    src={product.imageSrc}
                    alt={product.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <button className="absolute bottom-4 left-4 right-4 translate-y-12 group-hover:translate-y-0 bg-primary text-on-primary font-label-lg text-label-lg py-3 transition-all opacity-0 group-hover:opacity-100">
                  Add to Cart
                </button>
                {product.badge && (
                  <span className="absolute top-4 left-4 bg-primary text-on-primary text-[10px] px-2 py-1 font-label-lg uppercase">
                    {product.badge}
                  </span>
                )}
              </a>

              <h3 className="font-body-md font-semibold text-primary mb-1">{product.name}</h3>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">{product.price}</span>
                <div className="flex items-center text-secondary text-[14px]">
                  <span
                    className="material-symbols-outlined !text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span className="ml-1 text-on-surface-variant font-label-sm">
                    {product.rating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
