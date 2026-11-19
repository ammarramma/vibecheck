import { CATEGORY_ICONS } from "@/lib/category-icons";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  TONE_CLASSES,
  scoreTone,
} from "@/lib/format";
import type { ScanResult } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryGrid({ result }: { result: ScanResult }) {
  return (
    <section aria-labelledby="categories-heading">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 id="categories-heading" className="text-sm font-bold tracking-tight">
          Category breakdown
        </h2>
        <p className="text-[11px] text-muted-foreground">
          Weighted into the overall score
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {CATEGORY_ORDER.map((category) => {
          const meta = CATEGORY_META[category];
          const Icon = CATEGORY_ICONS[category];
          const row = result.categories.find(
            (entry) => entry.category === category,
          );

          if (!row) {
            return (
              <article
                key={category}
                className="rounded-xl border border-dashed border-border/70 bg-card/30 p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-bold">{meta.short}</span>
                </div>
                <p className="mt-4 font-mono text-lg font-bold text-muted-foreground">
                  —
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Not evaluated in this scan.
                </p>
              </article>
            );
          }

          const tone = TONE_CLASSES[scoreTone(row.score)];
          const evaluated = row.passed + row.warnings + row.failed;

          return (
            <article
              key={category}
              className="rounded-xl border border-border/70 bg-card/60 p-4 transition-colors hover:border-primary/25 hover:bg-card"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="truncate text-xs font-bold">{meta.short}</span>
                </span>
                <span
                  className={cn(
                    "font-mono text-xl font-bold leading-none tabular-nums",
                    tone.text,
                  )}
                >
                  {row.score}
                </span>
              </div>

              <div
                role="progressbar"
                aria-label={`${meta.label} score`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={row.score}
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-700 ease-out",
                    tone.bg,
                  )}
                  style={{ width: `${row.score}%` }}
                />
              </div>

              <div className="mt-2.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-chart-3" aria-hidden="true" />
                  {row.passed}
                  <span className="sr-only">passed</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-chart-4" aria-hidden="true" />
                  {row.warnings}
                  <span className="sr-only">warnings</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-destructive" aria-hidden="true" />
                  {row.failed}
                  <span className="sr-only">failed</span>
                </span>
                {row.skipped > 0 ? (
                  <span className="ml-auto font-mono text-muted-foreground/70">
                    {row.skipped} skipped
                  </span>
                ) : (
                  <span className="ml-auto font-mono text-muted-foreground/70">
                    {evaluated} checks
                  </span>
                )}
              </div>

              <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
                {meta.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
