const FEATURES = [
  {
    icon: 'local_shipping',
    title: 'Fast Delivery',
    description: 'Worldwide express shipping in 3–5 business days.',
  },
  {
    icon: 'verified_user',
    title: 'Secure Payment',
    description: '100% secure payment processing with top-tier encryption.',
  },
  {
    icon: 'undo',
    title: 'Easy Returns',
    description: 'Hassle-free 30-day return and exchange policy.',
  },
  {
    icon: 'diamond',
    title: 'Quality Products',
    description: 'Uncompromising craftsmanship using only the finest materials.',
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    quote:
      '"The quality of the Dhaka fabric blazer exceeded my expectations. It\'s a perfect blend of heritage and modern style."',
    name: 'Elena Rostova',
    role: 'Verified Buyer',
  },
  {
    id: 2,
    quote:
      '"Absolutely stunning pieces. The customer service is as premium as the clothing. I\'ll be back for the fall collection."',
    name: 'Marcus Thorne',
    role: 'Verified Buyer',
  },
  {
    id: 3,
    quote:
      '"A truly boutique experience online. Every detail, from the website to the packaging, feels curated and sophisticated."',
    name: 'Sofia Chen',
    role: 'Verified Buyer',
  },
];

function StarRow() {
  return (
    <div className="flex text-secondary mb-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined !text-sm"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

/**
 * Combines the "Why Choose Us" trust bar and the testimonials section.
 * Matches the original HTML's AtelierStory / community section.
 */
export default function AtelierStory() {
  return (
    <>
      <section className="py-section-desktop border-b border-outline-variant/30">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {FEATURES.map(({ icon, title, description }) => (
              <div key={title} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 flex items-center justify-center mb-6 bg-surface-container rounded-full group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
                  <span className="material-symbols-outlined !text-3xl">{icon}</span>
                </div>
                <h4 className="font-label-lg text-label-lg mb-2">{title}</h4>
                <p className="font-body-md text-on-surface-variant">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-section-desktop bg-surface-container-lowest">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg mb-4">From Our Community</h2>
            <div className="h-[1px] w-12 bg-primary mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {TESTIMONIALS.map(({ id, quote, name, role }) => (
              <div
                key={id}
                className="p-8 bg-surface border border-outline-variant/30 transition-shadow hover:shadow-xl hover:shadow-primary/5"
              >
                <StarRow />
                <p className="font-body-md text-on-surface-variant italic mb-8">{quote}</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed-dim mr-3" />
                  <div>
                    <span className="font-label-lg text-label-lg block">{name}</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}