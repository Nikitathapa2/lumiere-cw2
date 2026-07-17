import Link from 'next/link';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="u-label flex flex-wrap items-center gap-2 text-muted">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-2">
            {item.href && !last ? (
              <Link href={item.href} className="transition-opacity hover:opacity-60">
                {item.label}
              </Link>
            ) : (
              <span className={last ? 'text-ink' : undefined}>{item.label}</span>
            )}
            {!last ? <span aria-hidden>/</span> : null}
          </span>
        );
      })}
    </nav>
  );
}
