import Link from 'next/link';

const SHOPPING_LINKS = [
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: "Men's Collection", href: '/men' },
  { label: "Women's Collection", href: '/women' },
  { label: 'Sale & Special Offers', href: '/sale' },
];

const CARE_LINKS = [
  { label: 'Shipping & Delivery', href: '/shipping' },
  { label: 'Returns & Exchanges', href: '/returns' },
  { label: 'Size Guide', href: '/size-guide' },
  { label: 'Contact Us', href: '/contact' },
];

const COMPANY_LINKS = [
  { label: 'About LUMIÈRE', href: '/about' },
  { label: 'Journal', href: '/journal' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

function FooterLinkGroup({ title, links }) {
  return (
    <div>
      <h5 className="font-label-lg text-label-lg text-primary uppercase tracking-widest mb-8">
        {title}
      </h5>
      <ul className="space-y-4">
        {links.map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              className="font-body-md text-on-surface-variant hover:text-primary transition-opacity duration-200"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-surface-container border-t border-outline-variant/50">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter max-w-[1440px] mx-auto px-margin-desktop py-section-desktop">
        <div className="space-y-6">
          <Link
            href="/"
            className="font-headline-md text-headline-md text-primary tracking-tighter"
          >
            LUMIÈRE
          </Link>
          <p className="text-on-surface-variant font-body-md max-w-xs">
            Curating high-end fashion that bridges the gap between heritage
            craftsmanship and contemporary aesthetics.
          </p>
          <div className="flex space-x-4">
            {[
              { icon: 'public', label: 'Website' },
              { icon: 'camera', label: 'Instagram' },
              { icon: 'mail', label: 'Email' },
            ].map(({ icon, label }) => (
              <a
                key={icon}
                href="#"
                aria-label={label}
                className="w-10 h-10 flex items-center justify-center border border-outline-variant hover:bg-primary hover:text-on-primary transition-all"
              >
                <span className="material-symbols-outlined !text-xl">{icon}</span>
              </a>
            ))}
          </div>
        </div>

        <FooterLinkGroup title="Shopping" links={SHOPPING_LINKS} />
        <FooterLinkGroup title="Customer Care" links={CARE_LINKS} />
        <FooterLinkGroup title="Company" links={COMPANY_LINKS} />
      </div>

      <div className="max-w-[1440px] mx-auto px-margin-desktop py-8 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="font-body-md text-on-surface-variant text-sm">
          © {new Date().getFullYear()} LUMIÈRE Boutique. All Rights Reserved.
        </span>
        <div className="flex items-center space-x-6 grayscale opacity-50">
          <span className="material-symbols-outlined !text-2xl">payments</span>
          <span className="material-symbols-outlined !text-2xl">credit_card</span>
          <span className="material-symbols-outlined !text-2xl">account_balance_wallet</span>
        </div>
      </div>
    </footer>
  );
}