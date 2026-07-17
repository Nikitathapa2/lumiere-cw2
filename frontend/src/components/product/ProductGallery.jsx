import ProductImage from '@/components/ui/ProductImage';

export default function ProductGallery({ images = [], name = '' }) {
  const [main, detailA, detailB, lifestyle] = [
    images[0],
    images[1],
    images[2],
    images[3] || images[1],
  ];

  const Frame = ({ src, ratio = 'aspect-[3/4]', priority = false, grayscale = false }) => (
    <div className={`relative w-full overflow-hidden bg-surface ${ratio}`}>
      <ProductImage
        src={src}
        alt={name}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 55vw"
        className={`object-cover ${grayscale ? 'grayscale' : ''}`}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <Frame src={main} ratio="aspect-[4/5]" priority />
      {(detailA || detailB) && (
        <div className="grid grid-cols-2 gap-4">
          <Frame src={detailA} ratio="aspect-square" />
          <Frame src={detailB} ratio="aspect-square" />
        </div>
      )}
      <Frame src={lifestyle} ratio="aspect-[4/5]" grayscale />
    </div>
  );
}
