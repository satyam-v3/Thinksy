/** @type {import('tailwindcss').Config} */

export default {
    darkMode: "class",

    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],

    theme: {
        extend: {
            colors: {
                bg: "rgb(var(--bg) / <alpha-value>)",

                surface:
                    "rgb(var(--surface) / <alpha-value>)",

                surface2:
                    "rgb(var(--surface-2) / <alpha-value>)",

                border:
                    "rgb(var(--border) / <alpha-value>)",

                fg: "rgb(var(--fg) / <alpha-value>)",

                muted:
                    "rgb(var(--muted) / <alpha-value>)",

                accent:
                    "rgb(var(--accent) / <alpha-value>)",

                accent2:
                    "rgb(var(--accent-2) / <alpha-value>)",
            },

            fontFamily: {
                sans: [
                    "Geist",
                    "Inter",
                    "system-ui",
                    "sans-serif",
                ],

                mono: [
                    "JetBrains Mono",
                    "ui-monospace",
                    "monospace",
                ],

                display: [
                    "Instrument Serif",
                    "Georgia",
                    "serif",
                ],
            },

            keyframes: {
                "fade-up": {
                    "0%": {
                        opacity: "0",
                        transform:
                            "translateY(8px)",
                    },

                    "100%": {
                        opacity: "1",
                        transform:
                            "translateY(0)",
                    },
                },

                "bounce-dot": {
                    "0%, 80%, 100%": {
                        transform:
                            "scale(0.6)",

                        opacity: "0.4",
                    },

                    "40%": {
                        transform:
                            "scale(1)",

                        opacity: "1",
                    },
                },
            },

            animation: {
                "fade-up":
                    "fade-up 0.35s ease-out both",

                "bounce-dot":
                    "bounce-dot 1.4s ease-in-out infinite both",
            },
        },
    },

    plugins: [],
};