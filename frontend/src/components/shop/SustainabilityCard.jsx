import Link from 'next/link';

export default function SustainabilityCard() {
  return (
    <div className="flex aspect-[3/4] flex-col items-center justify-center bg-accent-bg px-6 text-center text-ink">
      <p className="u-label text-ink/70">Sustainability</p>
      <h3 className="mt-4 font-serif text-2xl">Traceable Origins</h3>
      <p className="mt-3 max-w-[14rem] text-sm leading-relaxed text-ink/75">
        Every fiber is accounted for, from pasture to studio.
      </p>
      <Link
        href="/sustainability"
        className="u-label mt-5 inline-block border-b border-ink pb-0.5 text-ink transition-opacity hover:opacity-60"
      >
        Read More
      </Link>
    </div>
  );
}
