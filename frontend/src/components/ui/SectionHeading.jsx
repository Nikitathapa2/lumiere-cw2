import { cn } from '@/lib/cn';

export default function SectionHeading({ title, action, centered = false, className }) {
  return (
    <div
      className={cn(
        'mb-8 flex items-end gap-4',
        centered ? 'flex-col items-center text-center' : 'justify-between',
        className
      )}
    >
      <h2 className="font-serif text-2xl md:text-3xl">{title}</h2>
      {action}
    </div>
  );
}
