import { type FormEvent, useRef, useState } from "react";
import {
  AlertCircle,
  CornerDownLeft,
  Globe2,
  Loader2,
  ScanSearch,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { normalizeTarget } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ScanFormProps {
  onScan: (url: string) => void;
  isScanning: boolean;
}

const QUICK_TARGETS = ["ammarramma.dev", "example.com"] as const;

export function ScanForm({ onScan, isScanning }: ScanFormProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function runScan(input: string) {
    const target = normalizeTarget(input);
    setError(null);
    setValue(target.url);
    onScan(target.url);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isScanning) return;

    try {
      runScan(value);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Enter a valid target URL.",
      );
      inputRef.current?.focus();
    }
  }

  function handleQuickTarget(target: string) {
    if (isScanning) return;
    try {
      runScan(target);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Enter a valid target URL.",
      );
    }
  }

  return (
    <div id="scan" className="relative mx-auto max-w-3xl scroll-mt-16">
      <div
        aria-hidden="true"
        className="absolute -inset-x-8 -bottom-8 -top-6 rounded-[2rem] bg-primary/5 blur-2xl"
      />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="relative rounded-2xl border border-border/70 bg-card/80 p-2 shadow-xl backdrop-blur-sm"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Globe2
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <label htmlFor="target-url" className="sr-only">
              Website URL to scan
            </label>
            <input
              ref={inputRef}
              id="target-url"
              name="url"
              type="text"
              inputMode="url"
              autoComplete="url"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="example.com"
              value={value}
              disabled={isScanning}
              onChange={(event) => {
                setValue(event.target.value);
                if (error) setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "target-url-error" : undefined}
              className={cn(
                "h-12 w-full rounded-xl border border-transparent bg-transparent pl-12 pr-11 text-base font-medium outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/30 focus:bg-background/40 disabled:opacity-60 sm:h-14 sm:text-[15px]",
                error && "border-destructive/40 bg-destructive/5",
              )}
            />
            {value && !isScanning ? (
              <button
                type="button"
                onClick={() => {
                  setValue("");
                  setError(null);
                  inputRef.current?.focus();
                }}
                aria-label="Clear URL"
                className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isScanning}
            className="h-12 w-full px-6 sm:h-14 sm:w-auto sm:px-7"
          >
            {isScanning ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Scanning…
              </>
            ) : (
              <>
                <ScanSearch className="size-4" aria-hidden="true" />
                Scan site
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col gap-1 px-3 pb-1 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3" aria-hidden="true" />
            Passive scan — no brute force, nothing stored.
          </p>
          <p className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex">
            <CornerDownLeft className="size-3" aria-hidden="true" />
            Enter to start
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2 pt-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
            Quick targets
          </span>
          {QUICK_TARGETS.map((target) => (
            <button
              key={target}
              type="button"
              onClick={() => handleQuickTarget(target)}
              disabled={isScanning}
              className="rounded-full border border-border/70 bg-background/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
            >
              {target}
            </button>
          ))}
        </div>

        {error ? (
          <p
            id="target-url-error"
            role="alert"
            className="flex items-start gap-1.5 px-3 pb-2 pt-1 text-xs font-medium text-destructive"
          >
            <AlertCircle
              className="mt-0.5 size-3.5 shrink-0"
              aria-hidden="true"
            />
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
