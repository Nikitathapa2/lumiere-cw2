const DEFAULT_CATEGORIES = [
  {
    id: 'women',
    label: 'Women',
    href: '/women',
    imageSrc: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    imageAlt: 'Women fashion editorial',
    size: 'large',
  },
  {
    id: 'men',
    label: 'Men',
    href: '/men',
    imageSrc: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    imageAlt: 'Men fashion editorial',
    size: 'medium',
  },
  {
    id: 'footwear',
    label: 'Footwear',
    href: '/footwear',
    imageSrc: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    imageAlt: 'Premium footwear',
    size: 'medium',
  },
  {
    id: 'accessories',
    label: 'Accessories',
    href: '/accessories',
    imageSrc: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    imageAlt: 'Luxury accessories',
    size: 'small',
  },
  {
    id: 'kids',
    label: 'Kids',
    href: '/kids',
    imageSrc: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80',
    imageAlt: "Children's premium fashion",
    size: 'small',
  },
];

const SIZE_CLASS = {
  large: 'md:col-span-2 md:row-span-2',
  medium: 'md:col-span-2',
  small: 'md:col-span-1',
};

function LabelOverlay({ label }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
      <div>
        <h3 className="text-on-primary font-headline-md text-headline-md mb-1">{label}</h3>
        <span className="text-on-primary/80 font-label-sm text-label-sm uppercase tracking-widest group-hover:pl-2 transition-all">
          Shop Collection
        </span>
      </div>
    </div>
  );
}

function CenteredOverlay({ label }) {
  return (
    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center text-center p-4">
      <h3 className="text-on-primary font-headline-md text-headline-md">{label}</h3>
    </div>
  );
}

/**
 * @param {{ categories?: typeof DEFAULT_CATEGORIES }} props
 */
export default function CuratedCategories({ categories = DEFAULT_CATEGORIES }) {
  return (
    <section className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-section-desktop">
      <div className="text-center mb-16">
        <h2 className="font-headline-lg text-headline-lg mb-4">Curated Categories</h2>
        <div className="h-[1px] w-12 bg-primary mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 h-auto md:h-[600px]">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={cat.href}
            className={`group relative overflow-hidden image-zoom ${SIZE_CLASS[cat.size] ?? ''}`}
          >
            <img
              src={cat.imageSrc}
              alt={cat.imageAlt}
              className="w-full h-full object-cover transition-transform duration-700"
            />
            {cat.size === 'small' ? (
              <CenteredOverlay label={cat.label} />
            ) : (
              <LabelOverlay label={cat.label} />
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
