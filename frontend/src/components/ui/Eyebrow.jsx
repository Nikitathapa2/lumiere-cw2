import { cn } from '@/lib/cn';

export default function Eyebrow({ accent = false, as: Tag = 'p', className, children }) {
  return (
    <Tag className={cn('u-label', accent ? 'text-accent' : 'text-muted', className)}>
      {children}
    </Tag>
  );
}
