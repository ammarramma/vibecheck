import { CATEGORY_ICONS } from "@/lib/category-icons";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/format";

export function Hero() {
  return (
    <section className="relative pb-9 pt-14 text-center sm:pb-12 sm:pt-20">
      <div className="mx-auto max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping-soft rounded-full bg-chart-3" />
            <span className="relative inline-flex size-1.5 rounded-full bg-chart-3" />
          </span>
          Passive · No signup · Rate-limited
        </span>

        <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-6xl">
          Shipped with AI? Audit your site&apos;s{" "}
          <span className="bg-gradient-to-r from-primary via-chart-2 to-accent bg-clip-text text-transparent">
            headers, TLS, exposed files,
          </span>{" "}
          and leaked secrets in seconds.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          One passive pass over TLS, security headers, exposed files, and leaked
          secrets. Vibe-Check grades the result from{" "}
          <span className="font-semibold text-foreground">A to F</span> and tells
          you exactly what to fix first.
        </p>

        <ul className="mt-7 flex flex-wrap items-center justify-center gap-2">
          {CATEGORY_ORDER.map((category) => {
            const Icon = CATEGORY_ICONS[category];
            return (
              <li
                key={category}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-[11px] font-medium text-muted-foreground"
              >
                <Icon className="size-3.5 text-primary" aria-hidden="true" />
                {CATEGORY_META[category].short}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
