import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronsUpDown,
  FilterX,
  Search,
  X,
} from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { StatusIcon } from "@/components/StatusIcon";
import { buttonClasses } from "@/components/ui/Button";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  STATUS_CLASSES,
  STATUS_META,
  isScanIssue,
} from "@/lib/format";
import type { CheckItem, CheckStatus, ScanCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "issues" | CheckStatus;
type CategoryFilter = "all" | ScanCategory;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "issues", label: "Issues" },
  { value: "pass", label: "Passed" },
  { value: "info", label: "Info" },
  { value: "skip", label: "Skipped" },
];

const SEVERITY: Record<CheckStatus, number> = {
  fail: 0,
  warn: 1,
  skip: 2,
  info: 3,
  pass: 4,
};

interface FindingsListProps {
  checks: CheckItem[];
}

function checkKey(check: CheckItem): string {
  return `${check.category}:${check.id}`;
}

export function FindingsList({ checks }: FindingsListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setQuery("");
    setOpenIds(new Set());
  }, [checks]);

  const counts = useMemo<Record<StatusFilter, number>>(() => {
    const base: Record<StatusFilter, number> = {
      all: checks.length,
      issues: 0,
      pass: 0,
      warn: 0,
      fail: 0,
      skip: 0,
      info: 0,
    };
    for (const check of checks) {
      base[check.status] += 1;
      if (isScanIssue(check.status)) base.issues += 1;
    }
    return base;
  }, [checks]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = checks.filter((check) => {
      if (statusFilter === "issues") {
        if (!isScanIssue(check.status)) return false;
      } else if (statusFilter !== "all" && check.status !== statusFilter) {
        return false;
      }

      if (categoryFilter !== "all" && check.category !== categoryFilter) {
        return false;
      }

      if (needle) {
        const haystack =
          `${check.title} ${check.detail ?? ""} ${check.id} ${check.category}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }

      return true;
    });

    if (statusFilter === "issues") {
      result.sort((a, b) => SEVERITY[a.status] - SEVERITY[b.status]);
    }

    return result;
  }, [checks, statusFilter, categoryFilter, query]);

  const allExpanded =
    filtered.length > 0 && filtered.every((check) => openIds.has(checkKey(check)));

  const hasActiveFilters =
    statusFilter !== "all" || categoryFilter !== "all" || query.trim() !== "";

  function toggleOpen(key: string) {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAll() {
    if (allExpanded) {
      setOpenIds(new Set());
      return;
    }
    setOpenIds(new Set(filtered.map(checkKey)));
  }

  function clearFilters() {
    setStatusFilter("all");
    setCategoryFilter("all");
    setQuery("");
  }

  return (
    <section
      aria-labelledby="findings-heading"
      className="overflow-hidden rounded-2xl border border-border/70 bg-card/70 shadow-lg"
    >
      <div className="border-b border-border/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 id="findings-heading" className="text-sm font-bold tracking-tight">
              Findings
            </h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
              {checks.length}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleAll}
            disabled={filtered.length === 0}
            className={buttonClasses("ghost", "sm")}
          >
            <ChevronsUpDown className="size-3.5" aria-hidden="true" />
            {allExpanded ? "Collapse all" : "Expand all"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Filter by status"
            className="flex flex-wrap items-center gap-0.5 rounded-lg bg-muted/60 p-1"
          >
            {STATUS_FILTERS.map((option) => {
              const active = statusFilter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatusFilter(option.value)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
                    active
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 font-mono text-[9px] tabular-nums",
                      active
                        ? "bg-primary/15 text-primary"
                        : "bg-background/50 text-muted-foreground",
                    )}
                  >
                    {counts[option.value]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative ml-auto">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <label htmlFor="findings-search" className="sr-only">
              Search findings
            </label>
            <input
              id="findings-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search findings…"
              className="h-9 w-full min-w-44 rounded-lg border border-border/70 bg-background/50 pl-8 pr-7 text-xs outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/40 sm:w-52"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            aria-pressed={categoryFilter === "all"}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
              categoryFilter === "all"
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/70 bg-card/40 text-muted-foreground hover:text-foreground",
            )}
          >
            All categories
          </button>
          {CATEGORY_ORDER.map((category) => {
            const Icon = CATEGORY_ICONS[category];
            const active = categoryFilter === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setCategoryFilter(category)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                  active
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/70 bg-card/40 text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-3" aria-hidden="true" />
                {CATEGORY_META[category].short}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
          <span className="grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground">
            <FilterX className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold">Nothing matches these filters</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a different status, category, or search term.
            </p>
          </div>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className={buttonClasses("outline", "sm")}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="divide-y divide-border/50">
          {filtered.map((check) => {
            const key = checkKey(check);
            const open = openIds.has(key);
            const detailId = `finding-detail-${key.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
            const CategoryGlyph = CATEGORY_ICONS[check.category];
            const statusClasses = STATUS_CLASSES[check.status];

            return (
              <li key={key} className="group">
                <button
                  type="button"
                  onClick={() => toggleOpen(key)}
                  aria-expanded={open}
                  aria-controls={detailId}
                  className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5"
                >
                  <StatusIcon status={check.status} className="mt-0.5" />

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-semibold leading-snug">
                        {check.title}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/40 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                        <CategoryGlyph className="size-2.5" aria-hidden="true" />
                        {CATEGORY_META[check.category].short}                      </span>
                    </span>
                    {check.detail ? (
                      <span className="mt-1 line-clamp-2 block text-[11px] leading-relaxed text-muted-foreground">
                        {check.detail}
                      </span>
                    ) : null}
                  </span>

                  <span className="flex shrink-0 items-center gap-2 pt-0.5">
                    <span
                      className={cn(
                        "hidden rounded-full px-2 py-0.5 text-[10px] font-semibold sm:inline-flex",
                        statusClasses.bg,
                        statusClasses.text,
                      )}
                    >
                      {STATUS_META[check.status].label}
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-4 text-muted-foreground transition-transform duration-200",
                        open && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </span>
                </button>

                {open ? (
                  <div
                    id={detailId}
                    className="animate-fade-in border-t border-border/40 bg-muted/15 px-4 py-4 sm:px-5"
                  >
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {check.detail ?? "No additional detail was provided."}
                    </p>

                    {check.evidence ? (
                      <div className="mt-3">
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Evidence
                          </span>
                          <CopyButton value={check.evidence} label="Copy" />
                        </div>
                        <pre className="max-h-44 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-border/60 bg-background/60 p-3 font-mono text-[11px] leading-relaxed">
                          {check.evidence}
                        </pre>
                        <p className="mt-1.5 text-[10px] text-muted-foreground/80">
                          May contain sensitive values — handle with care.
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-muted-foreground/80">
                      <span>id: {check.id}</span>
                      <span>category: {check.category}</span>
                      <span>status: {check.status}</span>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 px-4 py-3 text-[11px] text-muted-foreground sm:px-5">
        <span>
          Showing{" "}
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">{checks.length}</span>{" "}
          findings
        </span>
        <span className="hidden font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70 sm:inline">
          Click a row for detail
        </span>
      </div>
    </section>
  );
}
