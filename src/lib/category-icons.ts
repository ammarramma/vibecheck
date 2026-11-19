import {
  FileWarning,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { ScanCategory } from "@/lib/types";

export const CATEGORY_ICONS: Record<ScanCategory, LucideIcon> = {
  transport: LockKeyhole,
  headers: ShieldCheck,
  exposure: FileWarning,
  secrets: KeyRound,
};
