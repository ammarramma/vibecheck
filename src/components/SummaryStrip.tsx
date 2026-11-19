import { StatusIcon } from "@/components/StatusIcon";
import { STATUS_CLASSES, STATUS_META } from "@/lib/format";
import type { CheckStatus, Summary } from "@/lib/types";
import { cn } from "@/lib/utils";

const ORDER: CheckStatus[] = ["pass", "warn", "fail", "skip", "info"];

export function SummaryStrip({
  summary,
  grade,
}: {
  summary: Summary;
  grade: string;
}) {
  const counts: Record<CheckStatus, number> = {
    pass: summary.passed,
    warn: summary.warnings,
    fail: summary.failed,
    skip: summary.skipped,
    info: summary.info,
  };

  const visible = ORDER.filter(
    (status) => status === "pass" || status === "warn" || status === "fail" || counts[status] > 0,
  );

  return (
    <section className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-lg sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Result summary
        </h2>
        <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
          Grade {grade}
        </span>
      </div>

      <ul className="mt-3 flex flex-wrap gap-2">
        {visible.map((status) => {
          const meta = STATUS_META[status];
          const classes = STATUS_CLASSES[status];
          return (
            <li
              key={status}
              className={cn(
                "flex min-w-[6.5rem] flex-1 items-center gap-2.5 rounded-xl border p-2.5",
                classes.border,
                classes.bg,
              )}
            >
              <StatusIcon status={status} className="size-4" />
              <span className="min-w-0">
                <span className="block text-base font-bold leading-none tabular-nums">
                  {counts[status]}
                </span>
                <span className="mt-1 block truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {meta.plural}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-[11px] text-muted-foreground">
        <span className="font-semibold text-foreground">{summary.total}</span>{" "}
        checks ran ·{" "}
        <span className="font-semibold text-foreground">
          {summary.failed + summary.warnings}
        </span>{" "}
        need a look
      </p>
    </section>
  );
}
