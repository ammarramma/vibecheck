import { CalendarClock, Fingerprint, Timer } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import {
  TONE_CLASSES,
  formatDateTime,
  formatDuration,
  gradeLabel,
  hostnameOf,
  scoreTone,
} from "@/lib/format";
import type { ScanResult } from "@/lib/types";
import { cn } from "@/lib/utils";

const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreCard({
  result,
  requestId,
}: {
  result: ScanResult;
  requestId?: string;
}) {
  const score = Math.max(0, Math.min(100, result.score));
  const tone = TONE_CLASSES[scoreTone(score)];
  const offset = CIRCUMFERENCE * (1 - score / 100);
  const targetUrl = result.target.final_url || result.target.url;

  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5 shadow-lg sm:p-6">
      <div
        aria-hidden="true"
        className={cn(
          "absolute -right-12 -top-12 size-44 rounded-full blur-3xl",
          tone.softBg,
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Overall score
          </p>
          <p className={cn("mt-1 text-sm font-bold", tone.text)}>
            {gradeLabel(result.grade)} posture
          </p>
          <p
            className="mt-1 truncate font-mono text-[10px] text-muted-foreground"
            title={targetUrl}
          >
            {hostnameOf(targetUrl)}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1",
            tone.text,
            tone.softBg,
            tone.ring,
          )}
        >
          Grade {result.grade}
        </span>
      </div>

      <div className="relative mt-3 flex justify-center">
        <div className="relative size-44">
          <svg viewBox="0 0 200 200" className="size-full -rotate-90" aria-hidden="true">
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              className="fill-none stroke-muted"
              strokeWidth={11}
            />
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              className={cn(
                "fill-none transition-[stroke-dashoffset] duration-1000 ease-out",
                tone.stroke,
              )}
              strokeWidth={11}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Grade
            </span>
            <span
              className={cn(
                "text-6xl font-extrabold leading-none tracking-tight",
                tone.text,
              )}
            >
              {result.grade}
            </span>
            <span className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
              {result.score} / 100
            </span>
          </div>
        </div>
      </div>

      <div className="relative mt-1">
        <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
          <span>Score progress</span>
          <span className="font-mono tabular-nums">{score}%</span>
        </div>
        <div
          role="progressbar"
          aria-label="Overall security score"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={score}
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-1000 ease-out",
              tone.bg,
            )}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <dl className="relative mt-auto grid grid-cols-1 gap-2 border-t border-border/50 pt-4 text-[11px] sm:grid-cols-2">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Timer className="size-3.5 shrink-0" aria-hidden="true" />
          <dt className="sr-only">Scan duration</dt>
          <dd className="font-mono tabular-nums">
            {formatDuration(result.duration_ms)}
          </dd>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground sm:justify-end">
          <CalendarClock className="size-3.5 shrink-0" aria-hidden="true" />
          <dt className="sr-only">Scanned at</dt>
          <dd className="truncate">{formatDateTime(result.scanned_at)}</dd>
        </div>
        {requestId ? (
          <div className="col-span-full flex min-w-0 items-center gap-1.5 text-muted-foreground">
            <Fingerprint className="size-3.5 shrink-0" aria-hidden="true" />
            <dt className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em]">
              Request
            </dt>
            <dd className="min-w-0 flex-1 truncate font-mono text-[10px] text-foreground/70">
              {requestId}
            </dd>
            <CopyButton value={requestId} className="-my-1 -mr-2 shrink-0" />
          </div>
        ) : null}
      </dl>
    </section>
  );
}
