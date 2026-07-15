"use client";

import { useEffect, useMemo, useState } from "react";
import MpSubnav from "./MpSubnav";
import MercadoPublicoTable from "./MercadoPublicoTable";
import SkeletonTabla from "@/components/shared/SkeletonTabla";
import { useMercadoPublico } from "./useMercadoPublico";
import AvisoDesdeDb from "./AvisoDesdeDb";
import MercadoPublicoDetalleModal from "./MercadoPublicoDetalleModal";
import EstadoBadge from "./EstadoBadge";
import { formatFechaMp, formatMoneyMp } from "@/lib/mercado-publico/formatMp";

const PAGE_SIZE = 5;

export default function LicitacionesVisualizer() {
    const [busqueda, setBusqueda] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState("");
    const [orden, setOrden] = useState("");
    const [pagina, setPagina] = useState(1);
    const [detalleAbierto, setDetalleAbierto] = useState(null);
    const [parches, setParches] = useState({});

    useEffect(() => {
        setPagina(1);
    }, [busqueda, estadoFiltro, orden]);

    const { data, loading, refreshing, error, total, totalFiltrados, estados } =
        useMercadoPublico("licitaciones", {
            q: busqueda,
            estado: estadoFiltro,
            orden,
            page: pagina,
            pageSize: PAGE_SIZE,
        });

    const dataActualizada = useMemo(
        () => data.map((r) => (parches[r.codigo] ? { ...r, ...parches[r.codigo] } : r)),
        [data, parches]
    );

    function onDetalleCargado(fila) {
        setParches((prev) => ({ ...prev, [fila.codigo]: fila }));
    }

    const hayFiltros = Boolean(busqueda || estadoFiltro);
    const mostrandoCarga = loading && data.length === 0;

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
                            maxWidth: "280px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "var(--text-secondary)",
                            fontWeight: 600,
                            minWidth: 0,
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
                            maxWidth: "200px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "var(--text-muted)",
                            fontSize: "0.78rem",
                            minWidth: 0,
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
                    {formatMoneyMp(row.montoEstimado)}
                </span>
            ),
        },
        {
            key: "fechaCierre",
            label: "Fecha cierre",
            render: (row) => (
                <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                    {formatFechaMp(row.fechaCierre, { conHora: true })}
                </span>
            ),
        },
    ];

    return (
        <section className="flex flex-col gap-5 sm:gap-6">
            <MpSubnav />

            <div
                style={{
                    borderRadius: "1rem",
                    border: "1px solid color-mix(in srgb, var(--accent) 20%, var(--border))",
                    background: "color-mix(in srgb, var(--accent) 4%, var(--surface))",
                    padding: "1.35rem",
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
                <h1 className="text-2xl font-extrabold sm:text-[1.8rem]" style={{ margin: 0, color: "var(--text-secondary)" }}>
                    Licitaciones
                </h1>
                <p style={{ margin: 0, marginTop: "0.45rem", color: "var(--text-muted)", fontSize: "0.92rem", maxWidth: "60ch" }}>
                    Licitaciones sincronizadas desde Mercado Público
                </p>
            </div>

            <div className="kpi-grid kpi-grid--3">
                {[
                    { label: "Registros", value: total ?? 0 },
                    { label: "Filtrados", value: totalFiltrados ?? 0 },
                    { label: "Estados", value: estados.length },
                ].map((item) => (
                    <div key={item.label} className="kpi-card">
                        <p className="kpi-card-label">{item.label}</p>
                        <p className="kpi-card-value">{item.value}</p>
                    </div>
                ))}
            </div>
            <AvisoDesdeDb
                visible
                loading={loading || refreshing}
                hayFilas={total > 0 || data.length > 0}
                error={error}
            />

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                    borderRadius: "1rem",
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    padding: "1.1rem",
                }}
            >
                <input
                    type="text"
                    placeholder="Buscar por código o título..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="min-w-0 flex-1 basis-full sm:basis-56 sm:min-w-[200px]"
                    style={{
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
                    className="min-w-0 flex-1 basis-full sm:basis-40 sm:min-w-[140px]"
                    style={{
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

                <select
                    value={orden}
                    onChange={(e) => setOrden(e.target.value)}
                    className="min-w-0 flex-1 basis-full sm:basis-44 sm:min-w-[160px]"
                    style={{
                        padding: "0.7rem 0.9rem",
                        borderRadius: "0.75rem",
                        border: "1px solid var(--border)",
                        background: "var(--surface-2)",
                        color: "var(--text-secondary)",
                        fontSize: "0.84rem",
                        outline: "none",
                    }}
                >
                    <option value="">Orden predeterminado</option>
                    <option value="precio-desc">Precio (Mayor a menor)</option>
                    <option value="precio-asc">Precio (Menor a mayor)</option>
                    <option value="fecha-desc">Fecha (Mayor a menor)</option>
                    <option value="fecha-asc">Fecha (Menor a mayor)</option>
                </select>

                {hayFiltros && (
                    <button
                        type="button"
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

            {mostrandoCarga ? (
                <SkeletonTabla filas={8} columnas={5} />
            ) : !loading && totalFiltrados === 0 ? (
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
                        {hayFiltros
                            ? "No hay registros que coincidan con los filtros aplicados."
                            : "No hay licitaciones en Supabase todavía."}
                    </p>
                </div>
            ) : (
                <MercadoPublicoTable
                    columns={columns}
                    rows={dataActualizada}
                    onVerDetalle={setDetalleAbierto}
                    emptyMessage="Sin licitaciones disponibles."
                    labelPlural="licitaciones"
                    paginaTamano={PAGE_SIZE}
                    pagina={pagina}
                    totalFilas={totalFiltrados}
                    onPaginaChange={setPagina}
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
