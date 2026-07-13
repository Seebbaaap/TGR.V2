"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";

export default function ThemeToggleBtn() {
    const { theme, toggle } = useTheme();

    return (
        <button
            onClick={toggle}
            title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.45rem 0.55rem",
                borderRadius: "0.5rem",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                flexShrink: 0,
            }}
        >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            <span className="theme-label">
                {theme === "dark" ? "light" : "dark"}
            </span>
            <span
                aria-hidden="true"
                style={{
                    background: theme === "dark" ? "var(--accent)" : "var(--warning)",
                    boxShadow: `0 0 8px ${theme === "dark" ? "var(--accent)" : "var(--warning)"}`,
                    width: "28px",
                    height: "15px",
                    borderRadius: "999px",
                    position: "relative",
                    flexShrink: 0,
                    display: "inline-block",
                }}
            >
                <span
                    style={{
                        background: "var(--bg)",
                        width: "11px",
                        height: "11px",
                        borderRadius: "50%",
                        position: "absolute",
                        top: "2px",
                        left: theme === "dark" ? "2px" : "15px",
                        transition: "left 200ms ease",
                        display: "block",
                    }}
                />
            </span>
        </button>
    );
}
