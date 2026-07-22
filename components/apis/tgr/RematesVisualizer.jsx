"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Building2,
    Wallet,
    TrendingUp,
    BarChart2,
    Filter,
    RefreshCw,
} from "lucide-react";
import BotonesExportar from "@/components/shared/BotonesExportar";
import GraficoConcentracion from "@/components/apis/tgr/GraficoConcentracion";
import { formatCLP, formatCLPCompacto } from "@/utils/formatCurrency";

const POR_PAGINA = 5;

function KpiGrande({ icono: Icono, titulo, valor, color }) {
    return (
        <div
            style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "1.1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.875rem",
            }}
        >
            <div
                style={{
                    background: `color-mix(in srgb, ${color} 12%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
                    borderRadius: "10px",
                    padding: "0.6rem",
                    flexShrink: 0,
                }}
            >
                <Icono size={18} style={{ color }} />
            </div>
            <div>
                <p
                    style={{
                        color: "var(--text-muted)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginBottom: "2px",
                    }}
                >
                    {titulo}
                </p>
                <p
                    style={{
                        color,
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        fontFamily: "monospace",
                    }}
                >
                    {valor}
                </p>
            </div>
        </div>
    );
}

export default function RematesVisualizer({ datos = [] }) {
    const router = useRouter();
    const [busqueda, setBusqueda] = useState("");
    const [comunaFiltro, setComunaFiltro] = useState("TODAS");
    const [pagina, setPagina] = useState(1);
    const [recargando, setRecargando] = useState(false);

    const comunas = useMemo(() => {
        const set = new Set(datos.map((d) => d.comunaJuzgado).filter(Boolean));
        return ["TODAS", ...Array.from(set).sort()];
    }, [datos]);

    const datosFiltrados = useMemo(() => {
        let res = datos;
        if (comunaFiltro !== "TODAS") {
            res = res.filter((d) => d.comunaJuzgado === comunaFiltro);
        }
        if (busqueda.trim()) {
            const b = busqueda.toLowerCase();
            res = res.filter(
                (d) =>
                    (d.direccionRol ?? "").toLowerCase().includes(b) ||
                    (d.nombreDuegno ?? "").toLowerCase().includes(b) ||
                    (d.rol ?? "").toLowerCase().includes(b)
            );
        }
        return res;
    }, [datos, busqueda, comunaFiltro]);

    const totalMinimo = useMemo(
        () => datos.reduce((s, d) => s + (d.montoMinimo || d.montoAvaluo || 0), 0),
        [datos]
    );

    const promedioMinimo = useMemo(() => {
        const conMonto = datos.filter((d) => d.montoMinimo || d.montoAvaluo);
        if (!conMonto.length) return 0;
        return (
            conMonto.reduce((s, d) => s + (d.montoMinimo || d.montoAvaluo || 0), 0) /
            conMonto.length
        );
    }, [datos]);

    const maxMinimo = useMemo(
        () => Math.max(0, ...datos.map((d) => d.montoMinimo || d.montoAvaluo || 0)),
        [datos]
    );

    const totalPaginas = Math.ceil(datosFiltrados.length / POR_PAGINA);
    const datosPagina = datosFiltrados.slice(
        (pagina - 1) * POR_PAGINA,
        pagina * POR_PAGINA
    );

    async function forzarRecarga() {
        setRecargando(true);
        try {
            await fetch("/api/remates?recargar=1");
            window.location.reload();
        } finally {
            setRecargando(false);
        }
    }

    const COLUMNAS = [
        {
            key: "nombreDuegno",
            label: "Deudor",
            render: (v) => (
                <span
                    style={{
                        fontFamily: "monospace",
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        color: "var(--text-secondary)",
                    }}
                >
                    {v ? v.substring(0, 28) + (v.length > 28 ? "..." : "") : "—"}
                </span>
            ),
        },
        {
            key: "direccionRol",
            label: "Ubicación",
            render: (v) => (
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    {v ?? "—"}
                </span>
            ),
        },
        {
            key: "montoMinimo",
            label: "Tasación",
            render: (v, fila) => {
                const monto = v || fila.montoAvaluo;
                return (
                    <span
                        style={{
                            color: monto ? "var(--success)" : "var(--text-muted)",
                            fontFamily: "monospace",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                        }}
                    >
                        {monto ? formatCLP(monto) : "—"}
                    </span>
                );
            },
        },
        {
            key: "_accion",
            label: "Acciones",
            render: (_, fila) => (
                <button
                    onClick={() => {
                        const rolFormato = fila._raw?.rolFormato;
                        if (rolFormato) router.push(`/dashboard/tgr/${encodeURIComponent(rolFormato)}`);
                    }}
                    style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--accent)",
                        color: "var(--accent)",
                        padding: "4px 14px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                    }}
                >
                    Ver →
                </button>
            ),
        },
    ];

    return (
        <div className="flex min-w-0 flex-col gap-5 sm:gap-6">

            {/* KPIs */}
            <div className="kpi-grid kpi-grid--4">
                <KpiGrande icono={Building2} titulo="Propiedades Únicas" valor={datos.length.toLocaleString("es-CL")} color="var(--accent)" />
                <KpiGrande icono={Wallet} titulo="Volumen Real" valor={formatCLPCompacto(totalMinimo)} color="var(--success)" />
                <KpiGrande icono={TrendingUp} titulo="Promedio" valor={formatCLPCompacto(promedioMinimo)} color="var(--warning)" />
                <KpiGrande icono={BarChart2} titulo="Valor Máximo" valor={formatCLPCompacto(maxMinimo)} color="var(--danger)" />
            </div>

            {/* Filtros */}
            <div
                className="flex flex-wrap items-center gap-2.5 rounded-xl p-3.5 sm:gap-3 sm:p-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
                <div className="relative min-w-0 flex-1 basis-full sm:basis-56 sm:min-w-[220px]">
                    <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--accent)" }} />
                    <input
                        type="text"
                        placeholder="Deudor o Dirección..."
                        value={busqueda}
                        onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
                        style={{
                            width: "100%",
                            paddingLeft: "34px", paddingRight: "12px",
                            paddingTop: "8px", paddingBottom: "8px",
                            background: "var(--surface-2)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            color: "var(--text-secondary)",
                            fontSize: "0.85rem",
                            outline: "none",
                        }}
                    />
                </div>

                <div className="relative min-w-[180px]">
                    <Filter size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--warning)" }} />
                    <select
                        value={comunaFiltro}
                        onChange={(e) => { setComunaFiltro(e.target.value); setPagina(1); }}
                        style={{
                            width: "100%",
                            paddingLeft: "32px", paddingRight: "12px",
                            paddingTop: "8px", paddingBottom: "8px",
                            background: "var(--surface-2)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            color: "var(--text-secondary)",
                            fontSize: "0.85rem",
                            outline: "none",
                            appearance: "none",
                        }}
                    >
                        {comunas.map((c) => (
                            <option key={c} value={c} style={{ background: "var(--surface)" }}>{c}</option>
                        ))}
                    </select>
                </div>

                <BotonesExportar datos={datosFiltrados} nombre="remates_tgr" />

                <button
                    onClick={forzarRecarga}
                    disabled={recargando}
                    style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        color: recargando ? "var(--text-muted)" : "var(--text-secondary)",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        fontFamily: "monospace",
                        cursor: recargando ? "not-allowed" : "pointer",
                        flexShrink: 0,
                    }}
                >
                    <RefreshCw size={13} style={{ animation: recargando ? "spin 1s linear infinite" : "none" }} />
                    {recargando ? "Recargando..." : "Recargar"}
                </button>
            </div>

            {/* Tabla + Gráfico */}
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 340px" }}>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                        <thead>
                            <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                                {COLUMNAS.map((col) => (
                                    <th key={col.key} style={{
                                        textAlign: "left", padding: "0.75rem 1rem",
                                        color: "var(--text-muted)", fontSize: "0.7rem",
                                        fontFamily: "monospace", fontWeight: 700,
                                        letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap",
                                    }}>
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {datosPagina.length === 0 ? (
                                <tr>
                                    <td colSpan={COLUMNAS.length} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontFamily: "monospace" }}>
                                        // Sin resultados
                                    </td>
                                </tr>
                            ) : (
                                datosPagina.map((fila, i) => (
                                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                                        {COLUMNAS.map((col) => (
                                            <td key={col.key} style={{ padding: "0.75rem 1rem" }}>
                                                {col.render ? col.render(fila[col.key], fila) : fila[col.key] ?? "—"}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div style={{
                        padding: "0.75rem 1rem", borderTop: "1px solid var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "var(--surface-2)",
                    }}>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "monospace" }}>
                            Página {pagina} de {totalPaginas || 1}
                        </p>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1} style={{ background: "var(--surface)", border: "1px solid var(--border)", color: pagina === 1 ? "var(--text-muted)" : "var(--text-secondary)", padding: "4px 12px", borderRadius: "6px", fontSize: "0.8rem", cursor: pagina === 1 ? "not-allowed" : "pointer" }}>‹</button>
                            <button onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas || totalPaginas === 0} style={{ background: "var(--surface)", border: "1px solid var(--border)", color: (pagina === totalPaginas || totalPaginas === 0) ? "var(--text-muted)" : "var(--text-secondary)", padding: "4px 12px", borderRadius: "6px", fontSize: "0.8rem", cursor: (pagina === totalPaginas || totalPaginas === 0) ? "not-allowed" : "pointer" }}>›</button>
                        </div>
                    </div>
                </div>

                <GraficoConcentracion datos={datosFiltrados} />
            </div>

            <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontFamily: "monospace", textAlign: "right" }}>
                // fuente: TGR Chile — revalidación automática cada 60 min
            </p>
        </div>
    );
}
