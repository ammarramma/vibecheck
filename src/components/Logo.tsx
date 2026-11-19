import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  withDot?: boolean;
}

export function LogoMark({ className, withDot = true }: LogoMarkProps) {
  return (
    <span
      className={cn(
        "relative grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/25 via-primary/10 to-accent/20 font-mono ring-1 ring-primary/30",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="select-none text-[13px] font-bold leading-none tracking-tighter text-primary"
      >
        &gt;_
      </span>
      {withDot ? (
        <span className="absolute -right-1 -top-1 grid size-3.5 place-items-center rounded-full bg-card">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping-soft rounded-full bg-chart-3" />
            <span className="relative inline-flex size-2 rounded-full bg-chart-3" />
          </span>
        </span>
      ) : null}
    </span>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-3">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="whitespace-nowrap text-[17px] font-extrabold tracking-tight">
          vibe<span className="text-primary">-check</span>
        </span>
        <span className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground sm:block">
          Security scanner
        </span>
      </span>
    </span>
  );
}
