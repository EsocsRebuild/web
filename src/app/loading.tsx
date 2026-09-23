import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="grid gap-6 pt-[calc(var(--spacing-header)+4rem)] pb-24">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-16 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="aspect-[4/5] rounded-card" />
        ))}
      </div>
    </Container>
  );
}
