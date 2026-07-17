import Link from 'next/link';
import { cn } from '@/lib/cn';
import Price from './Price';
import ProductImage from './ProductImage';
import WishlistButton from '@/components/product/WishlistButton';

function StarRating({ rating, count }) {
  return (
    <div className="mt-1.5 flex items-center gap-1">
      <div className="flex gap-px">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={cn(
              'text-[12px] leading-none select-none',
              i + 1 <= Math.round(rating) ? 'text-amber-400' : 'text-line'
            )}
          >
            ★
          </span>
        ))}
      </div>
      {count > 0 && <span className="text-[11px] text-muted leading-none">({count})</span>}
    </div>
  );
}

export default function ProductCard({
  product,
  priceAlign = 'below',
  imageRatio = 'aspect-[3/4]',
  wishlist = true,
  className,
}) {
  const { slug, name, price, originalPrice, image, subLabel, isNewArrival, rating, reviewCount } =
    product;
  const href = slug ? `/product/${slug}` : '#';
  const salePercent =
    originalPrice && originalPrice > price
      ? Math.round((1 - price / originalPrice) * 100)
      : null;

  return (
    <div className={cn('group relative', className)}>
      {wishlist && slug ? (
        <WishlistButton
          slug={slug}
          className="absolute right-3 top-3 z-10 opacity-100 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
        />
      ) : null}

      {(isNewArrival || salePercent) && (
        <div className="absolute left-3 top-3 z-10 pointer-events-none">
          {salePercent ? (
            <span className="block bg-accent-bg text-ink text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5">
              {salePercent}% Off
            </span>
          ) : (
            <span className="block bg-ink text-white text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5">
              New
            </span>
          )}
        </div>
      )}

      <Link href={href} className="block">
        <div className={cn('relative overflow-hidden bg-surface', imageRatio)}>
          <ProductImage
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-lux group-hover:scale-[1.03]"
          />
        </div>

        {priceAlign === 'right' ? (
          <div className="mt-3">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink leading-snug">{name}</h3>
              <div className="flex-shrink-0 flex items-baseline gap-1.5">
                <Price value={price} className="text-sm text-ink" />
                {originalPrice && (
                  <Price value={originalPrice} className="text-xs text-muted line-through" />
                )}
              </div>
            </div>
            {subLabel ? <p className="u-label mt-1 text-muted">{subLabel}</p> : null}
            {rating != null ? <StarRating rating={rating} count={reviewCount ?? 0} /> : null}
          </div>
        ) : (
          <div className="mt-3">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink leading-snug">{name}</h3>
              <Price value={price} className="text-sm text-ink flex-shrink-0" />
            </div>
            {subLabel ? <p className="u-label mt-1 text-muted">{subLabel}</p> : null}
            {rating != null ? <StarRating rating={rating} count={reviewCount ?? 0} /> : null}
          </div>
        )}
      </Link>
    </div>
  );
}
