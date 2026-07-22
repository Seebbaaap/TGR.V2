"use client";

import { useEffect } from "react";

const MSG_SATURACION =
    "Estamos teniendo muchas solicitudes, por favor intenta nuevamente en unos segundos";

function esErrorSaturacion(error) {
    const msg = String(error ?? "").toLowerCase();
    return (
        msg.includes("timeout") ||
        msg.includes("canceling statement") ||
        msg.includes("too many") ||
        msg.includes("rate limit") ||
        msg.includes("429") ||
        msg.includes("503") ||
        msg.includes("overloaded") ||
        msg.includes("congest")
    );
}

export default function AvisoDesdeDb({
    visible = true,
    loading = false,
    hayFilas = false,
    error = null,
}) {
    useEffect(() => {
        if (error) {
            console.error("[Mercado Público] Error real al cargar datos:", error);
        }
    }, [error]);

    if (!visible) return null;

    const esError = Boolean(error) && !loading;
    let contenido = null;

    if (loading) {
        contenido = (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                    aria-hidden
                    style={{
                        width: "0.85rem",
                        height: "0.85rem",
                        border: "2px solid rgba(56,189,248,0.35)",
                        borderTopColor: "#38bdf8",
                        borderRadius: "50%",
                        animation: "mp-aviso-spin 0.75s linear infinite",
                        flexShrink: 0,
                    }}
                />
                Cargando datos, por favor espere...
            </span>
        );
    } else if (error) {
        contenido = esErrorSaturacion(error)
            ? MSG_SATURACION
            : "No se pudieron cargar los datos. Intenta nuevamente en unos segundos.";
    } else if (hayFilas) {
        contenido = "Actualización periódica ejecutada correctamente";
    }

    if (!contenido) return null;

    return (
        <>
            <style>{`
                @keyframes mp-aviso-spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
            <div
                role={esError ? "alert" : undefined}
                style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    border: esError
                        ? "1px solid var(--warning)"
                        : "1px solid #38bdf8",
                    background: esError
                        ? "color-mix(in srgb, var(--warning) 12%, transparent)"
                        : "rgba(56,189,248,0.1)",
                    color: esError ? "var(--warning)" : "#38bdf8",
                    fontSize: "0.82rem",
                }}
            >
                {contenido}
            </div>
        </>
    );
}
