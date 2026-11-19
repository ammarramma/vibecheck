import { useEffect, useRef, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, copyText } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({ value, label, className }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  async function handleCopy() {
    const ok = await copyText(value);
    setState(ok ? "copied" : "error");
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setState("idle"), 2000);
  }

  const Icon = state === "copied" ? Check : state === "error" ? X : Copy;
  const action = label?.replace(/^copy\s+/i, "");
  const title =
    state === "copied"
      ? "Copied to clipboard"
      : state === "error"
        ? "Copy failed"
        : action
          ? `Copy ${action} to clipboard`
          : "Copy to clipboard";

  return (
    <Button
      variant="ghost"
      size={label ? "sm" : "icon-sm"}
      onClick={handleCopy}
      title={title}
      aria-label={title}
      className={cn(
        state === "copied" && "text-chart-3 hover:text-chart-3",
        state === "error" && "text-destructive hover:text-destructive",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label ? (
        <span>
          {state === "copied" ? "Copied" : state === "error" ? "Failed" : label}
        </span>
      ) : null}
    </Button>
  );
}
