import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Clock3,
  ServerCrash,
  ShieldAlert,
  ShieldX,
  TimerOff,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScanApiError, describeDetails } from "@/lib/api";
import { hostnameOf } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ErrorPanelProps {
  error: Error;
  targetUrl?: string;
  onRetry: () => void;
  onReset: () => void;
}

interface ErrorPresentation {
  title: string;
  icon: LucideIcon;
  tone: "warn" | "danger";
}

function presentError(error: Error): ErrorPresentation {
  const api = error instanceof ScanApiError ? error : undefined;
  const status = api?.status ?? 0;
  const code = api?.code ?? "";

  if (status === 429 || code === "rate_limited") {
    return { title: "Rate limit reached", icon: Clock3, tone: "warn" };
  }
  if (status === 503 || code === "server_busy") {
    return { title: "Scanner is busy", icon: ServerCrash, tone: "warn" };
  }
  if (code === "blocked_target") {
    return { title: "Target blocked", icon: ShieldX, tone: "warn" };
  }
  if (code === "dns_error") {
    return { title: "DNS lookup failed", icon: WifiOff, tone: "warn" };
  }
  if (code === "tls_error") {
    return { title: "TLS handshake failed", icon: ShieldX, tone: "warn" };
  }
  if (code === "target_unreachable" || status === 502) {
    return { title: "Target unreachable", icon: WifiOff, tone: "warn" };
  }
  if (code === "invalid_url" || code === "invalid_request") {
    return { title: "Invalid target URL", icon: AlertTriangle, tone: "warn" };
  }
  if (code === "payload_too_large") {
    return { title: "Request too large", icon: ShieldX, tone: "warn" };
  }
  if (code === "scan_cancelled" || status === 408) {
    return { title: "Scan cancelled", icon: TimerOff, tone: "warn" };
  }
  if (code === "client_timeout" || code === "scan_timeout" || status === 504) {
    return { title: "Scan timed out", icon: TimerOff, tone: "warn" };
  }
  if (status === 0) {
    return { title: "Scanner unreachable", icon: WifiOff, tone: "danger" };
  }
  if (status === 400) {
    return { title: "Target couldn't be scanned", icon: AlertTriangle, tone: "warn" };
  }
  return { title: "Scan failed", icon: ShieldAlert, tone: "danger" };
}

const CODE_HINTS: Record<string, string> = {
  blocked_target:
    "Localhost, private ranges, and reserved addresses are blocked to prevent SSRF.",
  rate_limited: "The scanner allows a small number of scans per minute per IP.",
  server_busy: "All scan workers are busy. A short wait usually clears it.",
  dns_error: "The hostname could not be resolved. Check the domain and its DNS records.",
  tls_error:
    "The TLS handshake failed. The certificate may be invalid, expired, or misconfigured.",
  target_unreachable: "The site did not respond. It may be down or blocking the scanner.",
  scan_timeout: "The target did not finish responding before the scan deadline.",
  invalid_url: "Use a public http(s) URL, for example https://example.com.",
  invalid_request: "Check the URL and try again with a public http(s) target.",
  payload_too_large: "The submitted URL was larger than the scanner accepts.",
  scan_cancelled: "The scan was cancelled before it finished.",
};

const TONE_STYLES = {
  warn: {
    card: "border-chart-4/25 bg-chart-4/5",
    icon: "bg-chart-4/10 text-chart-4 ring-chart-4/25",
    title: "text-chart-4",
  },
  danger: {
    card: "border-destructive/25 bg-destructive/5",
    icon: "bg-destructive/10 text-destructive ring-destructive/25",
    title: "text-destructive",
  },
} as const;

export function ErrorPanel({
  error,
  targetUrl,
  onRetry,
  onReset,
}: ErrorPanelProps) {
  const presentation = presentError(error);
  const api = error instanceof ScanApiError ? error : undefined;
  const Icon = presentation.icon;
  const tone = TONE_STYLES[presentation.tone];

  const retryAfter = Math.max(0, api?.retryAfterSeconds ?? 0);
  const [remaining, setRemaining] = useState(retryAfter);

  useEffect(() => {
    setRemaining(retryAfter);
    if (retryAfter <= 0) return;

    const interval = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [retryAfter, error]);

  const reason = describeDetails(api?.details) ?? (api?.code ? CODE_HINTS[api.code] : undefined);

  return (
    <section
      id="scan-error"
      role="alert"
      aria-live="assertive"
      className={cn(
        "animate-fade-up scroll-mt-16 rounded-2xl border p-5 shadow-lg sm:p-6",
        tone.card,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl ring-1",
            tone.icon,
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={cn("text-sm font-bold", tone.title)}>
              {presentation.title}
            </h2>
            {api?.code ? (
              <span className="rounded-full border border-border/70 bg-background/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                {api.code}
              </span>
            ) : null}
            {api?.status ? (
              <span className="font-mono text-[10px] text-muted-foreground">
                HTTP {api.status}
              </span>
            ) : null}
          </div>

          <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">
            {error.message}
          </p>

          {targetUrl ? (
            <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
              Target: {hostnameOf(targetUrl)}
            </p>
          ) : null}

          {reason ? (
            <p className="mt-2 break-words font-mono text-[11px] leading-relaxed text-muted-foreground">
              {reason}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetry}
              disabled={remaining > 0}
            >
              {remaining > 0 ? `Retry in ${remaining}s` : "Try again"}
            </Button>
            <Button variant="ghost" size="sm" onClick={onReset}>
              Change URL
            </Button>
            {api?.requestId ? (
              <span className="ml-auto font-mono text-[10px] text-muted-foreground/80">
                req {api.requestId}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
