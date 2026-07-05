const TESTIMONIALS = [
  {
    quote:
      "The quality of the Dhaka fabric blazer exceeded my expectations. It's a perfect blend of heritage and modern style.",
    name: 'Elena Rostova',
    role: 'Verified Buyer',
  },
  {
    quote:
      "Absolutely stunning pieces. The customer service is as premium as the clothing. I'll be back for the fall collection.",
    name: 'Marcus Thorne',
    role: 'Verified Buyer',
  },
  {
    quote:
      'A truly boutique experience online. Every detail, from the website to the packaging, feels curated and sophisticated.',
    name: 'Sofia Chen',
    role: 'Verified Buyer',
  },
];

function Stars() {
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

export default function Testimonials() {
  return (
    <section className="py-section-desktop bg-surface-container-lowest">
      <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg mb-4">From Our Community</h2>
          <div className="h-[1px] w-12 bg-primary mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="p-8 bg-surface border border-outline-variant/30 transition-shadow hover:shadow-xl hover:shadow-primary/5"
            >
              <Stars />
              <p className="font-body-md text-on-surface-variant italic mb-8">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary-fixed-dim mr-3" />
                <div>
                  <span className="font-label-lg text-label-lg block">{t.name}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
