import { Moon, Sun } from "lucide-react";

import { useTheme } from "../hooks/useTheme";

export function ThemeToggle() {
    const { theme, toggle } = useTheme();

    const isDark = theme === "dark";

    return (
        <button
            data-testid="theme-toggle-btn"
            onClick={toggle}
            aria-label="Toggle theme"
            title={
                isDark
                    ? "Switch to light"
                    : "Switch to dark"
            }
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-fg transition-colors hover:bg-surface2"
        >
            {isDark ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
        </button>
    );
}