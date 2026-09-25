import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto grid max-w-wide gap-6 px-gutter py-8" aria-busy="true" aria-label="Loading">
      <Skeleton className="aspect-[21/9] w-full rounded-panel" />
      <Skeleton className="h-8 w-2/3 max-w-xl" />
      <Skeleton className="h-5 w-1/2 max-w-md" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-40 rounded-card" />
        ))}
      </div>
    </div>
  );
}
