import Button from '@/components/ui/Button';

export default function EmptyBag() {
  return (
    <div className="flex flex-col items-start gap-6 py-10">
      <p className="text-ink-soft">Your bag is currently empty.</p>
      <Button href="/collections" variant="primary" size="md">
        Explore the Collection
      </Button>
    </div>
  );
}
