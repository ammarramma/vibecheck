import { CheckCircle2, Download, RotateCcw } from "lucide-react";
import { CategoryGrid } from "@/components/CategoryGrid";
import { CopyButton } from "@/components/CopyButton";
import { FindingsList } from "@/components/FindingsList";
import { ScoreCard } from "@/components/ScoreCard";
import { SummaryStrip } from "@/components/SummaryStrip";
import { TargetCard } from "@/components/TargetCard";
import { TlsCard } from "@/components/TlsCard";
import { Button } from "@/components/ui/Button";
import { downloadJson, hostnameOf } from "@/lib/format";
import { buildMarkdownReport } from "@/lib/report";
import type { ApiMeta, ScanResult } from "@/lib/types";

interface ResultViewProps {
  result: ScanResult;
  meta?: ApiMeta | null;
  onReset: () => void;
}

function filenameFor(result: ScanResult): string {
  const host = hostnameOf(result.target.final_url || result.target.url).replace(
    /[^a-zA-Z0-9.-]+/g,
    "_",
  );
  const stamp = (result.scanned_at || new Date().toISOString())
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);
  return `vibecheck-${host}-${stamp}.json`;
}

export function ResultView({ result, meta, onReset }: ResultViewProps) {
  const host = hostnameOf(result.target.final_url || result.target.url);
  const requestId = meta?.request_id;
  const markdown = buildMarkdownReport(result, meta);

  return (
    <div id="results" className="animate-fade-up scroll-mt-16 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-chart-3/10 text-chart-3 ring-1 ring-chart-3/25">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold tracking-tight">Scan complete</h2>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {host} · {result.summary.total} checks
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <CopyButton value={markdown} label="Copy Markdown Report" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadJson(result, filenameFor(result))}
          >
            <Download className="size-3.5" aria-hidden="true" />
            Download JSON
          </Button>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="size-3.5" aria-hidden="true" />
            New scan
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ScoreCard result={result} requestId={requestId} />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-3">
          <SummaryStrip summary={result.summary} grade={result.grade} />
          <TargetCard target={result.target} durationMs={result.duration_ms} />
        </div>
      </div>

      <TlsCard result={result} />

      <CategoryGrid result={result} />
      <FindingsList checks={result.checks} />
    </div>
  );
}
