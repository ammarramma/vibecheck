import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { CATEGORY_META, CATEGORY_ORDER, hostnameOf } from "@/lib/format";

interface ScanningPanelProps {
  targetUrl: string;
  elapsedSeconds: number;
  onCancel: () => void;
}

export function ScanningPanel({
  targetUrl,
  elapsedSeconds,
  onCancel,
}: ScanningPanelProps) {
  return (
    <section
      id="scan-progress"
      aria-live="polite"
      aria-label="Scan in progress"
      className="animate-fade-up scroll-mt-16 rounded-2xl border border-primary/20 bg-card/70 p-5 shadow-lg sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/25">
            <span className="absolute inset-0 animate-ping-soft rounded-xl bg-primary/10" />
            <Loader2 className="relative size-5 animate-spin" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold">Scanning {hostnameOf(targetUrl)}</h2>
            <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
              {targetUrl}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border/70 bg-background/50 px-2.5 py-1 font-mono text-[11px] tabular-nums text-muted-foreground">
            {elapsedSeconds}s
          </span>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="size-3.5" aria-hidden="true" />
            Cancel
          </Button>
        </div>
      </div>

      <div className="mt-5 h-1 overflow-hidden rounded-full bg-muted">
        <div className="animate-progress h-full w-1/3 rounded-full bg-gradient-to-r from-primary via-chart-2 to-accent" />
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {CATEGORY_ORDER.map((category) => {
          const Icon = CATEGORY_ICONS[category];
          return (
            <div
              key={category}
              className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/30 px-3 py-2.5"
            >
              <Icon className="size-4 text-primary" aria-hidden="true" />
              <span className="flex-1 text-xs font-medium">
                {CATEGORY_META[category].label}
              </span>
              <span className="relative flex size-1.5" aria-hidden="true">
                <span className="absolute inline-flex size-full animate-ping-soft rounded-full bg-primary" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground">
        Running passive checks in parallel with the scanner&apos;s connection
        pool. Slow targets can take a few extra seconds.
      </p>
    </section>
  );
}
