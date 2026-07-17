import { cn } from '@/lib/cn';

// Hairline rule in --color-line.
export default function Divider({ className }) {
  return <hr className={cn('border-0 border-t border-line', className)} />;
}
