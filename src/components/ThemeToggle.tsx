import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Theme } from "@/hooks/useTheme";

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
    >
      {theme === "dark" ? (
        <Sun className="size-[18px] transition-transform duration-300" />
      ) : (
        <Moon className="size-[18px] transition-transform duration-300" />
      )}
    </Button>
  );
}
