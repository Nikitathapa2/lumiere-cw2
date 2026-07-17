/**
 * @param {{
 *   kicker?: string,
 *   title?: string,
 *   subtitle?: string,
 *   discountLabel?: string,
 *   discountSuffix?: string,
 *   ctaLabel?: string,
 *   ctaHref?: string,
 *   image?: string,
 *   imageAlt?: string,
 * }} props
 */
export default function PromotionalSection({
  kicker = 'Seasonal Offer',
  title = 'Artisanal Craftsmanship.\nSeasonal Sale.',
  subtitle =
    'Experience the heritage of Nepali hand-loomed fabrics reimagined for the modern world. For a limited time, enjoy unprecedented savings on our signature collections.',
  discountLabel = '50%',
  discountSuffix = 'Off Selected Pieces',
  ctaLabel = 'Shop the Sale',
  ctaHref = '/sale',
  image = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1280&q=80',
  imageAlt = 'Artisanal Fabric Close-up',
}) {
  return (
    <section className="flex flex-col lg:flex-row min-h-[600px]">
      <div className="w-full lg:w-1/2 flex items-center justify-center py-section-mobile lg:py-0 px-margin-mobile md:px-margin-desktop bg-primary text-on-primary">
        <div className="max-w-md">
          <span className="font-label-lg text-label-lg text-secondary tracking-[0.3em] uppercase mb-6 block">
            {kicker}
          </span>
          <h2 className="font-display-lg text-display-lg-mobile md:text-headline-lg mb-6 leading-tight whitespace-pre-line">
            {title}
          </h2>
          <p className="font-body-lg text-body-lg text-on-primary/70 mb-10">{subtitle}</p>

          <div className="space-y-6 mb-12">
            <div className="flex items-baseline space-x-4">
              <span className="text-6xl font-display-lg">{discountLabel}</span>
              <span className="font-label-lg text-label-lg uppercase tracking-widest">
                {discountSuffix}
              </span>
            </div>
          </div>

          <a
            href={ctaHref}
            className="inline-flex px-12 py-5 bg-on-primary text-primary font-label-lg text-label-lg hover:bg-secondary hover:text-primary transition-colors"
          >
            {ctaLabel}
          </a>
        </div>
      </div>

      <div className="w-full lg:w-1/2 relative h-[400px] lg:h-auto">
        <img src={image} alt={imageAlt} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/10" />
      </div>
    </section>
  );
}