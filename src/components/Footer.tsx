import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { SponsorGlyph } from "@/components/SponsorGlyph";
import { buttonClasses } from "@/components/ui/Button";
import { API_HOST, PORTFOLIO_URL } from "@/lib/env";
import { SPONSORS } from "@/lib/sponsors";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/60 bg-background/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        {SPONSORS.length > 0 ? (
          <section
            id="support"
            className="relative mb-9 scroll-mt-16 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/70 to-accent/10 p-5 shadow-lg sm:p-6"
          >
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl"
            />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Support the scanner
                </p>
                <h2 className="mt-1 text-lg font-bold tracking-tight">
                  Found something useful?
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Vibe-Check is free, passive, and stores nothing. If it saved
                  you a headache, fuel the next scan. Built by{" "}
                  {PORTFOLIO_URL ? (
                    <a
                      href={PORTFOLIO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      Ammar
                    </a>
                  ) : (
                    "Ammar"
                  )}
                  .
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {SPONSORS.map((sponsor, index) => (
                  <a
                    key={`${sponsor.label}-${sponsor.url}`}
                    href={sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses(
                      index === 0 ? "primary" : "outline",
                      "md",
                      "w-full sm:w-auto",
                    )}
                  >
                    <SponsorGlyph icon={sponsor.icon} />
                    {sponsor.label}
                  </a>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <LogoMark className="size-8" withDot={false} />
              <span className="text-sm font-bold tracking-tight">vibe-check</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              A passive security and leak scanner for public websites. It only
              reads what your site already serves — no brute force, no
              exploitation, no stored results.
            </p>
            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground/80">
              <ShieldCheck
                className="mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
              />
              Findings are indicators, not a full pentest. Verify anything
              critical before acting on it.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6 text-xs">
            <div className="space-y-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Elsewhere
              </p>
              {PORTFOLIO_URL ? (
                <a
                  href={PORTFOLIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-foreground/80 transition-colors hover:text-primary"
                >
                  Portfolio
                  <ArrowUpRight className="size-3" aria-hidden="true" />
                </a>
              ) : null}
              {SPONSORS.map((sponsor) => (
                <a
                  key={`${sponsor.label}-${sponsor.url}`}
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-foreground/80 transition-colors hover:text-primary"
                >
                  <SponsorGlyph icon={sponsor.icon} className="size-3" />
                  {sponsor.label}
                </a>
              ))}
              {!PORTFOLIO_URL && SPONSORS.length === 0 ? (
                <p className="text-muted-foreground">No links configured.</p>
              ) : null}
            </div>

            <div className="space-y-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Scanner
              </p>
              <a
                href="#scan"
                className="block text-foreground/80 transition-colors hover:text-primary"
              >
                Run a scan
              </a>
              {API_HOST ? (
                <p className="text-muted-foreground">
                  API{" "}
                  <span className="font-mono text-[11px] text-foreground/70">
                    {API_HOST}
                  </span>
                </p>
              ) : null}
              <p className="text-muted-foreground">v1 · passive checks</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border/50 pt-5 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Vibe-Check. Scan responsibly.</p>
          <p className="font-mono text-[10px] uppercase tracking-wider">
            A → F security grade · 0–100 score
          </p>
        </div>
      </div>
    </footer>
  );
}
