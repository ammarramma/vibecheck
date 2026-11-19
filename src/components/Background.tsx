export function Background() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-hero-glow" />
      <div className="absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_75%_55%_at_50%_0%,black,transparent_78%)]" />
      <div className="absolute -left-32 top-1/4 size-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -right-32 top-1/2 size-96 rounded-full bg-accent/5 blur-3xl" />
    </div>
  );
}
