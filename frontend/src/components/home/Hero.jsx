export default function Hero({
  kicker = 'Spring/Summer Collection',
  title = 'Discover Your Style',
  subtitle = 'Elevate your wardrobe with our latest curated pieces, where traditional craftsmanship meets contemporary silhouette.',
  ctaLabel = 'Shop Now',
  ctaHref = '/collections',
  secondaryCtaLabel = 'Explore Collection',
  secondaryCtaHref = '/collections',
  image = '/images/couple-winter-cloths-studio.jpg',
}) {
  return (
    <section className="relative overflow-hidden">
      {/* Sizes the section to the image's natural aspect ratio instead of a fixed viewport height */}
      <img alt="" aria-hidden="true" className="invisible w-full h-auto" src={image} />

      <div className="absolute inset-0 z-0">
        <img alt="Fashion Hero" className="w-full h-full object-cover" src={image} />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="absolute inset-0 z-10 flex items-center">
        <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop w-full">
          <div className="max-w-2xl -translate-y-24 md:-translate-y-40">
            <span className="font-label-lg text-label-lg text-on-primary tracking-[0.2em] uppercase mb-4 block">
              {kicker}
            </span>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-primary mb-6 drop-shadow-sm">
              {title}
            </h1>
            <p className="font-body-lg text-body-lg text-on-primary/90 mb-10 max-w-lg">{subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={ctaHref}
                className="inline-flex items-center justify-center px-10 py-4 bg-primary text-on-primary font-label-lg text-label-lg transition-transform hover:scale-105"
              >
                {ctaLabel}
              </a>
              <a
                href={secondaryCtaHref}
                className="inline-flex items-center justify-center px-10 py-4 border border-on-primary text-on-primary font-label-lg text-label-lg backdrop-blur-sm transition-all hover:bg-on-primary hover:text-primary"
              >
                {secondaryCtaLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
