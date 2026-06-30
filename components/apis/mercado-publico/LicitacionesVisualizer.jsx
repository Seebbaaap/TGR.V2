"use client";

import { useState, useMemo } from "react";
import MpSubnav from "./MpSubnav";
import MercadoPublicoTable from "./MercadoPublicoTable";
import SkeletonTabla from "@/components/shared/SkeletonTabla";
import { useMercadoPublico } from "./useMercadoPublico";
import AvisoDesdeDb from "./AvisoDesdeDb";
import MercadoPublicoDetalleModal from "./MercadoPublicoDetalleModal";



function formatFecha(valor) {
    if (!valor) return "—";
    const fecha = new Date(valor);
    if (isNaN(fecha.getTime())) return valor;
    return (
        fecha.toLocaleDateString("es-CL", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }) +
        " " +
        fecha.toLocaleTimeString("es-CL", {
            hour: "2-digit",
            minute: "2-digit",
        })
    );
}

function formatMoney(value) {
    const amount = Number(value || 0);
    if (!amount) return "—";
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    }).format(amount);
}

const BADGE_ESTILOS = {
    Publicada: { border: "#16a34a", bg: "rgba(22,163,74,0.12)", color: "#4ade80" },
    Adjudicada: { border: "#0284c7", bg: "rgba(2,132,199,0.12)", color: "#38bdf8" },
    Cerrada: { border: "#6b7280", bg: "rgba(107,114,128,0.12)", color: "#9ca3af" },
    Desierta: { border: "#d97706", bg: "rgba(217,119,6,0.12)", color: "#fbbf24" },
    Cancelada: { border: "#dc2626", bg: "rgba(220,38,38,0.12)", color: "#f87171" },
    Suspendida: { border: "#ea580c", bg: "rgba(234,88,12,0.12)", color: "#fb923c" },
    "En Evaluación": { border: "#7c3aed", bg: "rgba(124,58,237,0.12)", color: "#a78bfa" },
};

function EstadoBadge({ estado }) {
    const s = BADGE_ESTILOS[estado] || {
        border: "#6b7280",
        bg: "rgba(107,114,128,0.12)",
        color: "#9ca3af",
    };

    return (
        <span
            style={{
                display: "inline-block",
                padding: "0.15rem 0.65rem",
                borderRadius: "9999px",
                border: `1px solid ${s.border}`,
                background: s.bg,
                color: s.color,
                fontSize: "0.72rem",
                fontWeight: 500,
            }}
        >
            {estado || "Sin estado"}
        </span>
    );
}

export default function LicitacionesVisualizer() {
    const { data, loading, error, total, sincronizando } = useMercadoPublico("licitaciones");

    const [busqueda, setBusqueda] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState("");
    const [detalleAbierto, setDetalleAbierto] = useState(null);
    const [parches, setParches] = useState({});

    const dataActualizada = useMemo(
        () => data.map((r) => (parches[r.codigo] ? { ...r, ...parches[r.codigo] } : r)),
        [data, parches]
    );

    function onDetalleCargado(fila) {
        setParches((prev) => ({ ...prev, [fila.codigo]: fila }));
    }

    const estados = useMemo(() => {
        const values = dataActualizada.map((d) => d.estado).filter(Boolean);
        return [...new Set(values)].sort();
    }, [dataActualizada]);

    const filas = useMemo(() => {
        return dataActualizada.filter((row) => {
            const nombre = row.nombre ?? "";
            const codigo = row.codigo ?? "";
            const estado = row.estado ?? "";

            const q = busqueda.toLowerCase();
            const textMatch =
                !q ||
                nombre.toLowerCase().includes(q) ||
                codigo.toLowerCase().includes(q);

            const estadoMatch = !estadoFiltro || estado === estadoFiltro;
            return textMatch && estadoMatch;
        });
    }, [dataActualizada, busqueda, estadoFiltro]);

    const columns = [
        {
            key: "codigo",
            label: "Código",
            render: (row) => (
                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "monospace" }}>
                    {row.codigo ?? "—"}
                </span>
            ),
        },
        {
            key: "nombre",
            label: "Título",
            render: (row) => {
                const nombre = row.nombre ?? "—";
                return (
                    <span
                        style={{
                            display: "block",
                            maxWidth: "420px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "var(--text-secondary)",
                            fontWeight: 600,
                        }}
                        title={nombre}
                    >
                        {nombre}
                    </span>
                );
            },
        },
        {
            key: "estado",
            label: "Estado",
            render: (row) => <EstadoBadge estado={row.estado} />,
        },
        {
            key: "organismo",
            label: "Organismo",
            render: (row) => {
                const organismo = row.organismo ?? "—";
                return (
                    <span
                        style={{
                            display: "block",
                            maxWidth: "260px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "var(--text-muted)",
                            fontSize: "0.78rem",
                        }}
                        title={organismo}
                    >
                        {organismo}
                    </span>
                );
            },
        },
        {
            key: "montoEstimado",
            label: "Monto est.",
            render: (row) => (
                <span style={{ color: "var(--accent)", fontWeight: 600, fontFamily: "monospace", whiteSpace: "nowrap" }}>
                    {formatMoney(row.montoEstimado)}
                </span>
            ),
        },
        {
            key: "fechaCierre",
            label: "Fecha cierre",
            render: (row) => (
                <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                    {formatFecha(row.fechaCierre)}
                </span>
            ),
        },
    ];

    return (
        <section style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <MpSubnav />

            <div
                style={{
                    borderRadius: "1rem",
                    border: "1px solid color-mix(in srgb, var(--accent) 20%, var(--border))",
                    background: "color-mix(in srgb, var(--accent) 4%, var(--surface))",
                    padding: "1.25rem",
                }}
            >
                <p
                    style={{
                        margin: 0,
                        marginBottom: "0.35rem",
                        fontSize: "0.7rem",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "var(--accent)",
                        fontWeight: 700,
                    }}
                >
                    Mercado Público
                </p>
                <h1 style={{ margin: 0, color: "var(--text-secondary)", fontSize: "1.8rem", fontWeight: 800 }}>
                    Licitaciones
                </h1>
                <p style={{ margin: 0, marginTop: "0.45rem", color: "var(--text-muted)", fontSize: "0.92rem", maxWidth: "60ch" }}>
                    Licitaciones sincronizadas desde Mercado Público y servidas desde Supabase.
                </p>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "0.9rem",
                }}
            >
                {[
                    { label: "Registros", value: total ?? dataActualizada.length ?? 0 },
                    { label: "Filtrados", value: filas.length },
                    { label: "Estados", value: estados.length },
                ].map((item) => (
                    <div
                        key={item.label}
                        style={{
                            borderRadius: "0.9rem",
                            border: "1px solid var(--border)",
                            background: "var(--surface)",
                            padding: "1rem",
                        }}
                    >
                        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            {item.label}
                        </p>
                        <p style={{ margin: 0, marginTop: "0.35rem", color: "var(--text-secondary)", fontSize: "1.35rem", fontWeight: 800 }}>
                            {item.value}
                        </p>
                    </div>
                ))}
            </div>
            <AvisoDesdeDb
                visible
                sincronizando={sincronizando}
                hayFilas={data.length > 0}
            />
            {error && (
                <div

                    style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "0.75rem",
                        border: "1px solid var(--warning)",
                        background: "color-mix(in srgb, var(--warning) 10%, transparent)",
                        color: "var(--warning)",
                        fontSize: "0.82rem",
                    }}
                >

                    {error}
                </div>

            )}

            {!loading && (
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                        borderRadius: "1rem",
                        border: "1px solid var(--border)",
                        background: "var(--surface)",
                        padding: "1rem",
                    }}
                >
                    <input
                        type="text"
                        placeholder="Buscar por código o título..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        style={{
                            flex: 1,
                            minWidth: "240px",
                            padding: "0.7rem 0.9rem",
                            borderRadius: "0.75rem",
                            border: "1px solid var(--border)",
                            background: "var(--surface-2)",
                            color: "var(--text-secondary)",
                            fontSize: "0.84rem",
                            outline: "none",
                        }}
                    />

                    <select
                        value={estadoFiltro}
                        onChange={(e) => setEstadoFiltro(e.target.value)}
                        style={{
                            minWidth: "200px",
                            padding: "0.7rem 0.9rem",
                            borderRadius: "0.75rem",
                            border: "1px solid var(--border)",
                            background: "var(--surface-2)",
                            color: "var(--text-secondary)",
                            fontSize: "0.84rem",
                            outline: "none",
                        }}
                    >
                        <option value="">Todos los estados</option>
                        {estados.map((e) => (
                            <option key={e} value={e}>
                                {e}
                            </option>
                        ))}
                    </select>

                    {(busqueda || estadoFiltro) && (
                        <button
                            onClick={() => {
                                setBusqueda("");
                                setEstadoFiltro("");
                            }}
                            style={{
                                padding: "0.7rem 0.9rem",
                                borderRadius: "0.75rem",
                                border: "1px solid var(--danger)",
                                background: "transparent",
                                color: "var(--danger)",
                                fontSize: "0.84rem",
                                cursor: "pointer",
                            }}
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            )}

            {loading ? (
                <SkeletonTabla filas={8} columnas={5} />
            ) : filas.length === 0 ? (
                <div
                    style={{
                        padding: "3rem 1rem",
                        textAlign: "center",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.75rem",
                        background: "var(--surface)",
                    }}
                >
                    <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-secondary)", margin: 0, marginBottom: "0.45rem" }}>
                        Sin licitaciones
                    </p>
                    <p style={{ margin: 0, fontSize: "0.84rem" }}>
                        {busqueda || estadoFiltro
                            ? "No hay registros que coincidan con los filtros aplicados."
                            : "No hay licitaciones en Supabase. Espera a que termine la sincronización."}
                    </p>
                </div>
            ) : (
                <MercadoPublicoTable
                    columns={columns}
                    rows={filas}
                    onVerDetalle={setDetalleAbierto}
                    emptyMessage="Sin licitaciones disponibles."
                    labelPlural="licitaciones"
                />
            )}

            {detalleAbierto && (
                <MercadoPublicoDetalleModal
                    row={parches[detalleAbierto.codigo] ?? detalleAbierto}
                    modulo="licitaciones"
                    onClose={() => setDetalleAbierto(null)}
                    onDetalleCargado={onDetalleCargado}
                />
            )}
        </section>
    );
}

