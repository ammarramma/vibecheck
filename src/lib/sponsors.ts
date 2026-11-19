import { externalUrl } from "./utils";

export const SPONSOR_ICON_NAMES = [
  "coffee",
  "heart",
  "github",
  "star",
  "link",
] as const;

export type SponsorIconName = (typeof SPONSOR_ICON_NAMES)[number];

export interface Sponsor {
  label: string;
  url: string;
  icon: SponsorIconName;
}

function isSponsorIcon(value: unknown): value is SponsorIconName {
  return (
    typeof value === "string" &&
    (SPONSOR_ICON_NAMES as readonly string[]).includes(value)
  );
}

/**
 * Parse the sponsor list from a JSON env var.
 *
 * `VITE_SPONSORS` is a JSON array so adding a sponsor never requires a
 * component change. Invalid entries are ignored instead of breaking the UI.
 */
export function parseSponsors(raw: string | undefined): Sponsor[] {
  const value = raw?.trim();
  if (!value) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    console.warn(
      "[vibe-check] VITE_SPONSORS is not valid JSON. The support CTA is hidden.",
    );
    return [];
  }

  if (!Array.isArray(parsed)) {
    console.warn(
      "[vibe-check] VITE_SPONSORS must be a JSON array. The support CTA is hidden.",
    );
    return [];
  }

  const seen = new Set<string>();
  const sponsors: Sponsor[] = [];

  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;

    const record = item as Record<string, unknown>;
    const label = typeof record.label === "string" ? record.label.trim() : "";
    const url =
      typeof record.url === "string" ? externalUrl(record.url) : undefined;
    if (!label || !url || seen.has(url)) continue;

    seen.add(url);
    sponsors.push({
      label,
      url,
      icon: isSponsorIcon(record.icon) ? record.icon : "heart",
    });
  }

  return sponsors;
}

export const SPONSORS = parseSponsors(import.meta.env.VITE_SPONSORS);
