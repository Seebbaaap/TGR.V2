"use client";

import { useState } from "react";
import TablaSwipeHint from "@/components/shared/TablaSwipeHint";

export default function MercadoPublicoTable({
    columns = [],
    rows = [],
    emptyMessage = "No hay datos disponibles.",
    paginaTamano = 5,
    labelPlural = "registros",
    onVerDetalle,
}) {
    const [pagina, setPagina] = useState(1);
    const totalPaginas = Math.max(1, Math.ceil(rows.length / paginaTamano));
    const inicio = (pagina - 1) * paginaTamano;
    const visibles = rows.slice(inicio, inicio + paginaTamano);

    const estiloVer = {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.3rem 0.75rem",
        borderRadius: "0.4rem",
        border: "1px solid var(--accent)",
        color: "var(--accent)",
        fontSize: "0.75rem",
        fontWeight: 600,
        background: "transparent",
        cursor: "pointer",
        textDecoration: "none",
        whiteSpace: "nowrap",
    };

    const stickyAcciones = {
        position: "sticky",
        right: 0,
        zIndex: 1,
        background: "var(--surface)",
        boxShadow: "-8px 0 12px -12px rgba(0,0,0,0.45)",
    };

    return (
        <div className="min-w-0">
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                {rows.length} {labelPlural} · Página {pagina} de {totalPaginas}
            </p>

            <TablaSwipeHint />

            <div
                className="overflow-hidden rounded-xl"
                style={{
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                }}
            >
                <div className="overflow-x-auto">
                    <table style={{
                        width: "100%",
                        minWidth: "720px",
                        borderCollapse: "collapse",
                        fontSize: "0.82rem",
                    }}>
                        <thead>
                            <tr style={{ background: "var(--surface-2)" }}>
                                {columns.map((col) => (
                                    <th key={col.key} style={{
                                        padding: "0.65rem 1rem",
                                        textAlign: "left",
                                        fontSize: "0.7rem",
                                        fontWeight: 700,
                                        letterSpacing: "0.1em",
                                        textTransform: "uppercase",
                                        color: "var(--accent)",
                                        borderBottom: "1px solid var(--border)",
                                        whiteSpace: "nowrap",
                                    }}>
                                        {col.label}
                                    </th>
                                ))}
                                <th style={{
                                    padding: "0.65rem 1rem",
                                    textAlign: "right",
                                    fontSize: "0.7rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: "var(--accent)",
                                    borderBottom: "1px solid var(--border)",
                                    ...stickyAcciones,
                                    background: "var(--surface-2)",
                                }}>
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibles.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + 1} style={{
                                        padding: "2.5rem 1rem",
                                        textAlign: "center",
                                        color: "var(--text-muted)",
                                    }}>
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                visibles.map((row, index) => {
                                    const rowBg = index % 2 === 0
                                        ? "var(--surface)"
                                        : "color-mix(in srgb, var(--surface-2) 40%, var(--surface))";
                                    return (
                                        <tr key={row.id ?? row.codigo ?? index} style={{
                                            borderTop: "1px solid var(--border)",
                                            background: rowBg,
                                        }}>
                                            {columns.map((col) => (
                                                <td key={col.key} style={{
                                                    padding: "0.65rem 1rem",
                                                    color: "var(--text-secondary)",
                                                    verticalAlign: "middle",
                                                    maxWidth: col.maxWidth,
                                                }}>
                                                    {col.render ? col.render(row) : (row[col.key] ?? "—")}
                                                </td>
                                            ))}
                                            <td style={{
                                                padding: "0.65rem 1rem",
                                                textAlign: "right",
                                                ...stickyAcciones,
                                                background: rowBg,
                                            }}>
                                                {onVerDetalle ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => onVerDetalle(row)}
                                                        style={estiloVer}
                                                    >
                                                        Ver ›
                                                    </button>
                                                ) : (
                                                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPaginas > 1 && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 py-2">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        Página {pagina} de {totalPaginas}
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                            onClick={() => setPagina((p) => Math.max(1, p - 1))}
                            disabled={pagina === 1}
                            style={{
                                padding: "0.3rem 0.75rem",
                                borderRadius: "0.4rem",
                                border: "1px solid var(--border)",
                                background: "var(--surface-2)",
                                color: pagina === 1 ? "var(--text-muted)" : "var(--text-secondary)",
                                cursor: pagina === 1 ? "not-allowed" : "pointer",
                                fontSize: "0.8rem",
                            }}
                        >
                            ‹
                        </button>
                        <button
                            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                            disabled={pagina === totalPaginas}
                            style={{
                                padding: "0.3rem 0.75rem",
                                borderRadius: "0.4rem",
                                border: "1px solid var(--border)",
                                background: "var(--surface-2)",
                                color: pagina === totalPaginas ? "var(--text-muted)" : "var(--text-secondary)",
                                cursor: pagina === totalPaginas ? "not-allowed" : "pointer",
                                fontSize: "0.8rem",
                            }}
                        >
                            ›
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
