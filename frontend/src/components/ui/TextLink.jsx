import Link from 'next/link';
import { cn } from '@/lib/cn';

export default function TextLink({ href = '#', children, className, ...props }) {
  return (
    <Link href={href} className={cn('u-link', className)} {...props}>
      {children}
    </Link>
  );
}
