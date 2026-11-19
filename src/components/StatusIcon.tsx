import {
  AlertTriangle,
  CheckCircle2,
  Info,
  MinusCircle,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { STATUS_CLASSES } from "@/lib/format";
import type { CheckStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const STATUS_ICONS: Record<CheckStatus, LucideIcon> = {
  pass: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
  skip: MinusCircle,
  info: Info,
};

interface StatusIconProps {
  status: CheckStatus;
  className?: string;
}

export function StatusIcon({ status, className }: StatusIconProps) {
  const Icon = STATUS_ICONS[status];
  return (
    <Icon
      aria-hidden="true"
      className={cn("size-5 shrink-0", STATUS_CLASSES[status].text, className)}
    />
  );
}
