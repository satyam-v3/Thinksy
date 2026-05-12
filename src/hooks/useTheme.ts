import { useCallback, useEffect, useState } from "react";

import { storage } from "../lib/storage";

export type Theme = "light" | "dark";

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = storage.getTheme();

        if (saved) {
            return saved;
        }

        if (
            typeof window !== "undefined" &&
            window.matchMedia
        ) {
            return window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches
                ? "dark"
                : "light";
        }

        return "light";
    });

    useEffect(() => {
        const root = document.documentElement;

        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        storage.setTheme(theme);
    }, [theme]);

    const toggle = useCallback(() => {
        setThemeState((t) =>
            t === "dark"
                ? "light"
                : "dark"
        );
    }, []);

    return {
        theme,
        setTheme: setThemeState,
        toggle,
    };
}