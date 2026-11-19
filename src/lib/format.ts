import type { CheckStatus, ScanCategory } from "./types";

export interface CategoryMeta {
  label: string;
  short: string;
  description: string;
}

export const CATEGORY_META: Record<ScanCategory, CategoryMeta> = {
  transport: {
    label: "Transport & TLS",
    short: "Transport",
    description: "HTTPS, certificate health, TLS version, and redirects.",
  },
  headers: {
    label: "Security headers",
    short: "Headers",
    description: "HSTS, CSP, clickjacking, referrer, and cookie flags.",
  },
  exposure: {
    label: "Exposed files",
    short: "Exposure",
    description: "Leaked .env files, Git metadata, backups, and configs.",
  },
  secrets: {
    label: "Leaked secrets",
    short: "Secrets",
    description: "API keys, tokens, private keys, and credentials in HTML.",
  },
};

export const CATEGORY_ORDER: ScanCategory[] = [
  "transport",
  "headers",
  "exposure",
  "secrets",
];

export interface StatusMeta {
  label: string;
  plural: string;
  description: string;
}

export const STATUS_META: Record<CheckStatus, StatusMeta> = {
  pass: {
    label: "Passed",
    plural: "Passed",
    description: "This check passed.",
  },
  warn: {
    label: "Warning",
    plural: "Warnings",
    description: "Worth reviewing, but not critical.",
  },
  fail: {
    label: "Failed",
    plural: "Failed",
    description: "This check needs attention.",
  },
  skip: {
    label: "Skipped",
    plural: "Skipped",
    description: "Not applicable or not verifiable.",
  },
  info: {
    label: "Info",
    plural: "Info",
    description: "Informational finding.",
  },
};

export type ScoreTone = "good" | "fair" | "poor";

export function scoreTone(score: number): ScoreTone {
  if (score >= 80) return "good";
  if (score >= 60) return "fair";
  return "poor";
}

/**
 * Tone classes for score text/backgrounds. Kept central so the gauge,
 * category bars, and summary chips stay consistent.
 */
export const TONE_CLASSES: Record<
  ScoreTone,
  { text: string; bg: string; softBg: string; ring: string; stroke: string }
> = {
  good: {
    text: "text-chart-3",
    bg: "bg-chart-3",
    softBg: "bg-chart-3/10",
    ring: "ring-chart-3/25",
    stroke: "text-chart-3",
  },
  fair: {
    text: "text-chart-4",
    bg: "bg-chart-4",
    softBg: "bg-chart-4/10",
    ring: "ring-chart-4/25",
    stroke: "text-chart-4",
  },
  poor: {
    text: "text-destructive",
    bg: "bg-destructive",
    softBg: "bg-destructive/10",
    ring: "ring-destructive/25",
    stroke: "text-destructive",
  },
};

export const STATUS_CLASSES: Record<
  CheckStatus,
  { text: string; bg: string; border: string }
> = {
  pass: {
    text: "text-chart-3",
    bg: "bg-chart-3/10",
    border: "border-chart-3/20",
  },
  warn: {
    text: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/20",
  },
  fail: {
    text: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
  },
  skip: {
    text: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
  },
  info: {
    text: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
};

export function gradeLabel(grade: string): string {
  switch (grade.toUpperCase()) {
    case "A":
      return "Excellent";
    case "B":
      return "Good";
    case "C":
      return "Fair";
    case "D":
      return "Weak";
    case "E":
      return "Poor";
    case "F":
      return "Critical";
    default:
      return "Unknown";
  }
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export function hostnameOf(value: string): string {
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

export interface NormalizedTarget {
  url: string;
  hostname: string;
}

/**
 * Accepts "example.com", "example.com/path" or a full URL. Adds https://
 * when the scheme is missing, then applies the same rules the scanner does.
 */
export function normalizeTarget(input: string): NormalizedTarget {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Enter a URL to scan.");
  }

  const withScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    throw new Error("That doesn't look like a valid URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http:// and https:// targets are supported.");
  }
  if (!parsed.hostname) {
    throw new Error("The URL needs a hostname, for example example.com.");
  }
  if (parsed.username || parsed.password) {
    throw new Error("Remove embedded credentials from the URL before scanning.");
  }
  if (withScheme.length > 2048) {
    throw new Error("The URL is too long (maximum 2048 characters).");
  }

  return { url: parsed.toString(), hostname: parsed.hostname };
}

export function statusCodeTone(status: number): "good" | "fair" | "poor" {
  if (status >= 200 && status < 400) return "good";
  if (status >= 400 && status < 500) return "fair";
  return "poor";
}

export function isScanIssue(status: CheckStatus): boolean {
  return status === "fail" || status === "warn";
}

export function downloadJson(result: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(result, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
