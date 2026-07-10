import Image from 'next/image';
import Button from '@/components/ui/Button';

export default function EssenceBanner({
  title = 'The Essence of Form',
  ctaLabel = 'Explore the Journal',
  ctaHref = '/journal',
  image = 'https://picsum.photos/seed/lumiere-essence/1600/900',
}) {
  return (
    <section className="relative aspect-[16/7] w-full overflow-hidden">
      <Image src={image} alt="" fill sizes="100vw" className="object-cover grayscale" />
      <div className="absolute inset-0 bg-ink/40" />
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-on-dark">
        <h2 className="font-serif text-3xl md:text-5xl">{title}</h2>
        <Button href={ctaHref} variant="light" size="md" className="mt-7">
          {ctaLabel}
        </Button>
      </div>
    </section>
  );
}
