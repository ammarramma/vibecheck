import type { SVGProps } from "react";
import { Coffee, ExternalLink, Heart, Star } from "lucide-react";
import type { SponsorIconName } from "@/lib/sponsors";
import { cn } from "@/lib/utils";

type GlyphProps = SVGProps<SVGSVGElement>;

function GithubMark(props: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56v-2.17c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

const GLYPHS = {
  coffee: Coffee,
  heart: Heart,
  github: GithubMark,
  star: Star,
  link: ExternalLink,
} as const;

interface SponsorGlyphProps {
  icon: SponsorIconName;
  className?: string;
}

export function SponsorGlyph({ icon, className }: SponsorGlyphProps) {
  const Icon = GLYPHS[icon];
  return <Icon className={cn("size-4", className)} aria-hidden="true" />;
}
