import Link from 'next/link';
import { cn } from '@/lib/cn';

function pageHref(searchParams, page) {
  const next = new URLSearchParams();
  Object.entries(searchParams || {}).forEach(([k, v]) => {
    if (v && k !== 'page') next.set(k, v);
  });
  if (page > 1) next.set('page', String(page));
  const qs = next.toString();
  return qs ? `?${qs}` : '?';
}

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push('…');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

const cellCls =
  'flex h-9 w-9 items-center justify-center border text-sm tabular-nums transition-colors';

export default function Pagination({ page, totalPages, searchParams }) {
  if (totalPages <= 1) return null;
  const pageNums = getPageNumbers(page, totalPages);

  return (
    <nav className="mt-16 flex items-center justify-center gap-1" aria-label="Pagination">
      {page > 1 ? (
        <Link
          href={pageHref(searchParams, page - 1)}
          aria-label="Previous page"
          className={cn(cellCls, 'border-line text-ink hover:border-ink')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            chevron_left
          </span>
        </Link>
      ) : (
        <span className={cn(cellCls, 'border-line text-muted cursor-not-allowed')}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            chevron_left
          </span>
        </span>
      )}

      {pageNums.map((p, i) =>
        p === '…' ? (
          <span key={`el-${i}`} className={cn(cellCls, 'border-transparent text-muted')}>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(searchParams, p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              cellCls,
              p === page
                ? 'border-ink bg-ink text-white'
                : 'border-line text-ink hover:border-ink'
            )}
          >
            {p}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link
          href={pageHref(searchParams, page + 1)}
          aria-label="Next page"
          className={cn(cellCls, 'border-line text-ink hover:border-ink')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            chevron_right
          </span>
        </Link>
      ) : (
        <span className={cn(cellCls, 'border-line text-muted cursor-not-allowed')}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            chevron_right
          </span>
        </span>
      )}
    </nav>
  );
}
