import Link from 'next/link';
import Image from 'next/image';

function Card({ collection }) {
  const { slug, title, heroImage } = collection;
  return (
    <Link href={`/collections/${slug}`} className="group relative block aspect-[3/4] overflow-hidden">
      <Image
        src={heroImage || `https://picsum.photos/seed/lumiere-col-${slug}/900/1200`}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-transform duration-700 ease-lux group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-on-dark">
        <h3 className="font-serif text-2xl">{title}</h3>
        <span className="u-label mt-2 inline-block border-b border-on-dark/70 pb-0.5 text-on-dark">
          Explore Collection
        </span>
      </div>
    </Link>
  );
}

export default function CollectionCards({ collections = [] }) {
  if (!collections.length) return null;
  return (
    <section className="section py-6">
      <div className="container-lux grid grid-cols-1 gap-5 md:grid-cols-3">
        {collections.slice(0, 3).map((c) => (
          <Card key={c.slug} collection={c} />
        ))}
      </div>
    </section>
  );
}
