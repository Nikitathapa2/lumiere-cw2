const FEATURES = [
  { icon: 'local_shipping', title: 'Fast Delivery', text: 'Worldwide express shipping in 3-5 business days.' },
  { icon: 'verified_user', title: 'Secure Payment', text: '100% secure payment processing with top-tier encryption.' },
  { icon: 'undo', title: 'Easy Returns', text: 'Hassle-free 30-day return and exchange policy.' },
  { icon: 'diamond', title: 'Quality Products', text: 'Uncompromising craftsmanship using only the finest materials.' },
];

export default function WhyChooseUs() {
  return (
    <section className="py-section-desktop border-b border-outline-variant/30">
      <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 flex items-center justify-center mb-6 bg-surface-container rounded-full group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
                <span className="material-symbols-outlined !text-3xl">{f.icon}</span>
              </div>
              <h4 className="font-label-lg text-label-lg mb-2">{f.title}</h4>
              <p className="font-body-md text-on-surface-variant">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
