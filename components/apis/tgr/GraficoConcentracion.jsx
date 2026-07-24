"use client";

import { useMemo } from "react";

export default function GraficoConcentracion({ datos }) {
    const top10 = useMemo(() => {
        const conteo = {};
        datos.forEach((d) => {
            const c = d.comunaJuzgado || "DESCONOCIDA";
            conteo[c] = (conteo[c] || 0) + 1;
        });
        return Object.entries(conteo)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([comuna, total]) => ({ comuna, total }));
    }, [datos]);

    const max = top10[0]?.total || 1;

    return (
        <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "1.25rem",
            height: "100%",
        }}>
            <h3 style={{
                color: "var(--text-secondary)",
                fontSize: "0.8rem",
                fontWeight: 700,
                marginBottom: "1rem",
            }}>
                Concentración Geográfica{" "}
                <span style={{ color: "var(--warning)" }}>(Top 10)</span>
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {top10.map(({ comuna, total }, i) => (
                    <div key={comuna} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>

                        {/* Label comuna */}
                        <p style={{
                            color: "var(--text-muted)",
                            fontSize: "0.68rem",
                            fontFamily: "monospace",
                            width: "72px",
                            maxWidth: "30%",
                            textAlign: "right",
                            flexShrink: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                            title={comuna}
                        >
                            {comuna}
                        </p>

                        {/* Barra */}
                        <div style={{
                            flex: 1,
                            background: "var(--surface-2)",
                            borderRadius: "4px",
                            height: "20px",
                            overflow: "hidden",
                        }}>
                            <div style={{
                                width: `${(total / max) * 100}%`,
                                height: "100%",
                                // Naranja para #1, azul apagado para el resto — igual que referencia
                                background: i === 0
                                    ? "var(--warning)"
                                    : "color-mix(in srgb, var(--accent) 70%, var(--surface))",
                                borderRadius: "4px",
                                transition: "width 0.6s ease",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                paddingRight: "6px",
                            }}>
                                <span style={{
                                    color: i === 0 ? "#0a0a0f" : "var(--text)",
                                    fontSize: "0.65rem",
                                    fontFamily: "monospace",
                                    fontWeight: 700,
                                }}>
                                    {total}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}