"use client";

import { useState } from "react";
import CollaborateModal from "./CollaborateModal";

export default function CollaborateBtn() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                title="Sumarte al proyecto"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.65rem 1rem",
                    borderRadius: "0.75rem",
                    border: "1px solid color-mix(in srgb, var(--accent) 35%, var(--border))",
                    background: "color-mix(in srgb, var(--accent) 10%, var(--surface-2))",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "all 160ms ease",
                    minWidth: 0,
                    flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "color-mix(in srgb, var(--accent) 16%, var(--surface-2))";
                    e.currentTarget.style.borderColor = "color-mix(in srgb, var(--accent) 60%, var(--border))";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "color-mix(in srgb, var(--accent) 10%, var(--surface-2))";
                    e.currentTarget.style.borderColor = "color-mix(in srgb, var(--accent) 35%, var(--border))";
                }}
            >
                <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "28px",
                    height: "28px",
                    borderRadius: "999px",
                    background: "color-mix(in srgb, var(--accent) 20%, var(--surface))",
                    color: "var(--accent)",
                    fontSize: "0.9rem",
                    flexShrink: 0,
                }}>✉</span>
                <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, minWidth: 0 }}>
                    <span style={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "var(--text-secondary)",
                        whiteSpace: "nowrap",
                    }}>
                        ¿Quieres colaborar?
                    </span>
                    <span className="collab-sub">Súmate acá</span>
                </span>
            </button>

            {open && <CollaborateModal onClose={() => setOpen(false)} />}
        </>
    );
}
