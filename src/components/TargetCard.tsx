import type { ReactNode } from "react";
import {
  ArrowRight,
  Globe2,
  Link2,
  LockKeyhole,
  Server,
} from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import {
  STATUS_CLASSES,
  TONE_CLASSES,
  formatDuration,
  hostnameOf,
  statusCodeTone,
} from "@/lib/format";
import type { TargetInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TargetCardProps {
  target: TargetInfo;
  durationMs: number;
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
      <dd className="mt-1.5 text-xs">{children}</dd>
    </div>
  );
}

export function TargetCard({ target, durationMs }: TargetCardProps) {
  const redirected = target.final_url && target.final_url !== target.url;
  const codeTone = TONE_CLASSES[statusCodeTone(target.status_code)];

  return (
    <section className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-lg sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Target
        </h2>
        <span className="rounded-full border border-border/70 bg-background/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          {formatDuration(durationMs)}
        </span>
      </div>

      <dl className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <Field icon={Globe2} label="Requested URL" className="sm:col-span-2">
          <div className="flex items-start gap-1.5">
            <span className="min-w-0 flex-1 break-all font-mono text-[11px] text-foreground/85">
              {target.url}
            </span>
            <CopyButton
              value={target.url}
              className="-my-1 -mr-1 shrink-0"
            />
          </div>
        </Field>

        {redirected ? (
          <Field icon={ArrowRight} label="Final URL" className="sm:col-span-2">
            <span className="break-all font-mono text-[11px] text-foreground/85">
              {target.final_url}
            </span>
          </Field>
        ) : null}

        <Field icon={Link2} label="HTTP status">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] font-semibold",
              codeTone.softBg,
              codeTone.text,
            )}
          >
            <span className={cn("size-1.5 rounded-full", codeTone.bg)} />
            {target.status_code}
          </span>
        </Field>

        <Field icon={Server} label="Server">
          <span className="break-all font-mono text-[11px] text-foreground/85">
            {target.server?.trim() || "Not disclosed"}
          </span>
        </Field>

        <Field icon={LockKeyhole} label="TLS">
          <span className="font-mono text-[11px] text-foreground/85">
            {target.tls_version?.trim() || "Not detected"}
          </span>
        </Field>

        <Field icon={ArrowRight} label="Scheme">
          <span className="text-[11px] text-foreground/85">
            {target.final_url.startsWith("https://") ? (
              <span className={cn("font-semibold", STATUS_CLASSES.pass.text)}>
                HTTPS
              </span>
            ) : (
              <span className={cn("font-semibold", STATUS_CLASSES.fail.text)}>
                Plain HTTP
              </span>
            )}{" "}
            <span className="font-mono text-muted-foreground">
              · {hostnameOf(target.final_url)}
            </span>
          </span>
        </Field>
      </dl>
    </section>
  );
}
