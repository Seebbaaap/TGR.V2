"use client";

import { useState } from "react";
import { Droplets, Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const FASTAPI_URL = "https://tgr-agua-production.up.railway.app";

function NivelBadge({ nivel }) {
    const colores = {
        ALTO:  { bg: "color-mix(in srgb, var(--success) 15%, transparent)", border: "var(--success)", color: "var(--success)" },
        MEDIO: { bg: "color-mix(in srgb, var(--warning) 15%, transparent)", border: "var(--warning)", color: "var(--warning)" },
        BAJO:  { bg: "color-mix(in srgb, var(--danger) 15%, transparent)",  border: "var(--danger)",  color: "var(--danger)"  },
    };
    const c = colores[nivel] || colores.BAJO;
    return (
        <span style={{
            background: c.bg, border: `1px solid ${c.border}`, color: c.color,
            padding: "2px 10px", borderRadius: "999px",
            fontSize: "0.7rem", fontFamily: "monospace", fontWeight: 700,
        }}>
            {nivel}
        </span>
    );
}

function BarraScore({ score }) {
    const color = score >= 70 ? "var(--success)" : score >= 40 ? "var(--warning)" : "var(--danger)";
    return (
        <div style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "monospace" }}>Score agua</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color, fontFamily: "monospace" }}>{score}/100</span>
            </div>
            <div style={{ background: "var(--surface)", borderRadius: "999px", height: "6px", overflow: "hidden" }}>
                <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: "999px", transition: "width 0.6s ease" }} />
            </div>
        </div>
    );
}

export default function AnalisisAgua({ rolFormato }) {
    const [estado, setEstado] = useState("idle"); // idle | cargando | ok | error
    const [resultado, setResultado] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");

    async function analizar() {
        setEstado("cargando");
        setResultado(null);
        setErrorMsg("");

        try {
            const resp = await fetch(`${FASTAPI_URL}/remates/por-rol/${encodeURIComponent(rolFormato)}`);
            if (!resp.ok) {
                const err = await resp.json();
                throw new Error(err.detail || `Error ${resp.status}`);
            }
            const data = await resp.json();
            setResultado(data);
            setEstado("ok");
        } catch (e) {
            setErrorMsg(e.message);
            setEstado("error");
        }
    }

    // ── Botón inicial ─────────────────────────────────────────────────────────
    if (estado === "idle") {
        return (
            <button onClick={analizar} style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                border: "1px solid var(--accent)", color: "var(--accent)",
                padding: "0.5rem 1rem", borderRadius: "8px",
                fontSize: "0.8rem", fontFamily: "monospace", fontWeight: 700,
                cursor: "pointer", width: "100%", justifyContent: "center",
            }}>
                <Droplets size={14} />
                Analizar agua subterránea
            </button>
        );
    }

    // ── Cargando ──────────────────────────────────────────────────────────────
    if (estado === "cargando") {
        return (
            <div style={{
                display: "flex", alignItems: "center", gap: "8px", justifyContent: "center",
                padding: "0.75rem", color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "monospace",
            }}>
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                Consultando SII, DGA y topografía...
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (estado === "error") {
        return (
            <div style={{
                background: "color-mix(in srgb, var(--danger) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--danger) 40%, transparent)",
                borderRadius: "10px", padding: "0.75rem 1rem",
                display: "flex", flexDirection: "column", gap: "8px",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <AlertTriangle size={14} style={{ color: "var(--danger)" }} />
                    <span style={{ color: "var(--danger)", fontSize: "0.78rem", fontFamily: "monospace" }}>
                        {errorMsg}
                    </span>
                </div>
                <button onClick={analizar} style={{
                    background: "none", border: "1px solid var(--border)",
                    color: "var(--text-muted)", padding: "4px 12px",
                    borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer",
                    fontFamily: "monospace",
                }}>
                    Reintentar
                </button>
            </div>
        );
    }

    // ── Resultado ─────────────────────────────────────────────────────────────
    const { score_agua, dga, topografia, ubicacion_sii, destino_sii } = resultado;

    return (
        <div style={{
            background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: "12px", padding: "1rem",
            display: "flex", flexDirection: "column", gap: "0.75rem",
        }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Droplets size={14} style={{ color: "var(--accent)" }} />
                    <span style={{ color: "var(--accent)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        Análisis agua subterránea
                    </span>
                </div>
                <NivelBadge nivel={score_agua.nivel} />
            </div>

            {/* Barra de score */}
            <BarraScore score={score_agua.score} />

            {/* Puede perforar */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {score_agua.puede_perforar
                    ? <CheckCircle size={13} style={{ color: "var(--success)" }} />
                    : <XCircle size={13} style={{ color: "var(--danger)" }} />
                }
                <span style={{ fontSize: "0.78rem", color: score_agua.puede_perforar ? "var(--success)" : "var(--danger)", fontFamily: "monospace" }}>
                    {score_agua.puede_perforar ? "Puede perforar pozo" : "Zona de prohibición DGA"}
                </span>
            </div>

            {/* Datos */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {[
                    ["Pozos DGA (2km)", dga.pozos_2km],
                    ["Caudal prom.", dga.caudal_promedio_ls ? `${dga.caudal_promedio_ls} l/s` : "—"],
                    ["Topografía", topografia.elevacion_relativa],
                    ["Pendiente", `${topografia.pendiente_pct}%`],
                    ["Uso SII", destino_sii || "—"],
                    ["Ubicación", ubicacion_sii || "—"],
                ].map(([label, valor]) => (
                    <div key={label}>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>{label}</p>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontFamily: "monospace", fontWeight: 600 }}>{valor ?? "—"}</p>
                    </div>
                ))}
            </div>

            {/* Advertencias */}
            {score_agua.advertencias?.length > 0 && (
                <div style={{
                    background: "color-mix(in srgb, var(--warning) 8%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--warning) 30%, transparent)",
                    borderRadius: "8px", padding: "0.6rem 0.75rem",
                }}>
                    {score_agua.advertencias.map((a, i) => (
                        <p key={i} style={{ color: "var(--warning)", fontSize: "0.75rem", lineHeight: 1.5 }}>⚠ {a}</p>
                    ))}
                </div>
            )}
        </div>
    );
}