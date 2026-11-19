import { ArrowUpRight, Heart } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { buttonClasses } from "@/components/ui/Button";
import type { ApiHealthStatus } from "@/hooks/useApiHealth";
import type { Theme } from "@/hooks/useTheme";
import { PORTFOLIO_URL } from "@/lib/env";
import { SPONSORS } from "@/lib/sponsors";
import type { HealthInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  health: ApiHealthStatus;
  healthInfo: HealthInfo | null;
}

const HEALTH_META: Record<
  ApiHealthStatus,
  { label: string; dot: string; text: string; pulse: boolean }
> = {
  checking: {
    label: "Checking API",
    dot: "bg-chart-4",
    text: "text-muted-foreground",
    pulse: true,
  },
  online: {
    label: "API live",
    dot: "bg-chart-3",
    text: "text-chart-3",
    pulse: true,
  },
  offline: {
    label: "API offline",
    dot: "bg-destructive",
    text: "text-destructive",
    pulse: false,
  },
};

function HealthBadge({
  status,
  info,
}: {
  status: ApiHealthStatus;
  info: HealthInfo | null;
}) {
  const meta = HEALTH_META[status];
  const title =
    status === "online"
      ? `mapi /healthz ok${info?.version ? ` · ${info.version}` : ""}`
      : status === "checking"
        ? "Checking the scanner API…"
        : "The scanner API is not responding";

  return (
    <span
      role="status"
      aria-live="polite"
      title={title}
      className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/40 px-2.5 py-1"
    >
      <span className="relative flex size-1.5 shrink-0">
        {meta.pulse ? (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping-soft rounded-full",
              meta.dot,
            )}
          />
        ) : null}
        <span
          className={cn("relative inline-flex size-1.5 rounded-full", meta.dot)}
        />
      </span>
      <span
        className={cn(
          "font-mono text-[10px] font-semibold uppercase tracking-wider max-sm:sr-only",
          meta.text,
        )}
      >
        {meta.label}
      </span>
    </span>
  );
}

export function Header({
  theme,
  onToggleTheme,
  health,
  healthInfo,
}: HeaderProps) {
  return (
    <header className="glass sticky top-0 z-40 border-b border-border/50">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <a
            href="#top"
            aria-label="Vibe-Check home"
            className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Logo />
          </a>
          <span
            aria-hidden="true"
            className="hidden h-5 w-px bg-border sm:block"
          />
          <HealthBadge status={health} info={healthInfo} />
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1">
          {SPONSORS.length > 0 ? (
            <a
              href="#support"
              aria-label="Support the project"
              className={buttonClasses("ghost", "sm")}
            >
              <Heart className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Support</span>
            </a>
          ) : null}

          {PORTFOLIO_URL ? (
            <span className="hidden md:block">
              <a
                href={PORTFOLIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses("ghost", "sm")}
              >
                <span>Portfolio</span>
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            </span>
          ) : null}

          <span
            aria-hidden="true"
            className="mx-1 hidden h-5 w-px bg-border sm:block"
          />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
