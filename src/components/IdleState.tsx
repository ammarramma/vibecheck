import { Scale, ShieldCheck } from "lucide-react";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/format";

export function IdleState() {
  return (
    <section
      aria-labelledby="capabilities-heading"
      className="mt-12 animate-fade-up sm:mt-14"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="capabilities-heading"
            className="text-lg font-bold tracking-tight"
          >
            What the scan looks at
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Four weighted categories, graded together into one score.
          </p>
        </div>
        <span className="rounded-full border border-border/70 bg-card/60 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Read-only
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORY_ORDER.map((category, index) => {
          const Icon = CATEGORY_ICONS[category];
          const meta = CATEGORY_META[category];
          return (
            <article
              key={category}
              className="group rounded-xl border border-border/70 bg-card/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary/15">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-mono text-[10px] text-muted-foreground/70">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-bold">{meta.label}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {meta.description}
              </p>
            </article>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-chart-3/10 text-chart-3 ring-1 ring-chart-3/20">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </span>
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">
              Passive by design.
            </span>{" "}
            No logins, no fuzzing, no exploitation. The scanner follows
            redirects and samples a small set of well-known paths — nothing
            more.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <Scale className="size-4" aria-hidden="true" />
          </span>
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">
              Weighted grading.
            </span>{" "}
            Categories are weighted into a 0–100 score and an A–F grade.
            Critical findings cap the grade, even when everything else passes.
          </p>
        </div>
      </div>
    </section>
  );
}
