export function SkipLink({ href = "#main" }: { href?: string }) {
  return (
    <a
      href={href}
      className="fixed top-3 left-3 z-[100] -translate-y-24 rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground focus:translate-y-0"
    >
      Skip to content
    </a>
  );
}
