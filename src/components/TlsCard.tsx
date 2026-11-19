import type { ReactNode } from "react";
import {
  ArrowRight,
  CalendarClock,
  Globe2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { StatusIcon } from "@/components/StatusIcon";
import { STATUS_CLASSES, STATUS_META, formatDateTime } from "@/lib/format";
import type { CheckItem, CheckStatus, ScanResult } from "@/lib/types";
import { cn } from "@/lib/utils";

function findCheck(result: ScanResult, id: string): CheckItem | undefined {
  return result.checks.find((check) => check.id === id);
}

/** Parses mapi's "subject=...; issuer=...; not_after=..." evidence format. */
function parseEvidence(evidence?: string): Record<string, string> {
  const values: Record<string, string> = {};
  if (!evidence) return values;

  for (const part of evidence.split(";")) {
    const separator = part.indexOf("=");
    if (separator <= 0) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key && value) values[key] = value;
  }

  return values;
}

function StatusPill({ status }: { status?: CheckStatus }) {
  if (!status) {
    return (
      <span className="rounded-full border border-border/70 bg-muted/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
        Not evaluated
      </span>
    );
  }

  const classes = STATUS_CLASSES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        classes.bg,
        classes.text,
      )}
    >
      <StatusIcon status={status} className="size-3" />
      {STATUS_META[status].label}
    </span>
  );
}

function Field({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: typeof Globe2;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="size-3" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1.5 min-w-0 text-xs">{children}</dd>
    </div>
  );
}

function worstStatus(
  statuses: Array<CheckStatus | undefined>,
): CheckStatus | undefined {
  const severity: CheckStatus[] = ["fail", "warn", "pass", "info", "skip"];
  return severity.find((status) => statuses.includes(status));
}

export function TlsCard({ result }: { result: ScanResult }) {
  const httpsCheck = findCheck(result, "https_enabled");
  const certCheck = findCheck(result, "tls_certificate");
  const redirectCheck = findCheck(result, "https_redirect");
  const evidence = parseEvidence(certCheck?.evidence);
  const overallStatus = worstStatus([
    httpsCheck?.status,
    certCheck?.status,
    redirectCheck?.status,
  ]);
  const redirects = Boolean(
    result.target.final_url &&
      result.target.final_url !== result.target.url &&
      result.target.final_url.startsWith("https://"),
  );

  return (
    <section className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-lg sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          TLS &amp; redirect
        </h2>
        <StatusPill status={overallStatus} />
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <Field icon={LockKeyhole} label="Protocol">
            <span className="font-mono text-[11px] text-foreground/85">
              {result.target.tls_version?.trim() || "Not detected"}
            </span>
          </Field>

          <Field icon={ShieldCheck} label="Certificate">
            <StatusPill status={certCheck?.status} />
          </Field>

          <Field icon={Globe2} label="Issued to" className="sm:col-span-2">
            <span
              className="block break-all font-mono text-[11px] text-foreground/85"
              title={evidence.subject}
            >
              {evidence.subject || "Certificate details not returned"}
            </span>
          </Field>

          <Field icon={ShieldCheck} label="Issuer" className="sm:col-span-2">
            <span
              className="block break-all font-mono text-[11px] text-foreground/85"
              title={evidence.issuer}
            >
              {evidence.issuer || "Not available"}
            </span>
          </Field>

          <Field icon={CalendarClock} label="Expires">
            <span className="font-mono text-[11px] text-foreground/85">
              {evidence.not_after
                ? formatDateTime(evidence.not_after)
                : "Not available"}
            </span>
          </Field>
        </dl>

        <div className="flex flex-col rounded-xl border border-border/60 bg-background/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <ArrowRight className="size-3" aria-hidden="true" />
              HTTP → HTTPS
            </p>
            <StatusPill status={redirectCheck?.status} />
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            {redirectCheck?.detail ??
              (redirects
                ? "The final URL uses HTTPS."
                : "No redirect information was returned.")}
          </p>

          {redirectCheck?.evidence ? (
            <p className="mt-2 break-all rounded-md bg-muted/50 px-2 py-1.5 font-mono text-[10px] text-foreground/70">
              {redirectCheck.evidence}
            </p>
          ) : null}

          {certCheck?.detail ? (
            <p className="mt-auto border-t border-border/50 pt-3 text-[11px] leading-relaxed text-muted-foreground">
              {certCheck.detail}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
