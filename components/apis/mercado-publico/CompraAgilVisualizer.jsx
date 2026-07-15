"use client";

import { useState, useMemo } from "react";
import MpSubnav from "./MpSubnav";
import MercadoPublicoTable from "./MercadoPublicoTable";
import SkeletonTabla from "@/components/shared/SkeletonTabla";
import { useMercadoPublico } from "./useMercadoPublico";
import AvisoDesdeDb from "./AvisoDesdeDb";
import MercadoPublicoDetalleModal from "./MercadoPublicoDetalleModal";
import EstadoBadge from "./EstadoBadge";
import { ordenarFilasMp } from "@/lib/mercado-publico/ordenarFilasMp";
import { formatFechaMp, formatMoneyMp } from "@/lib/mercado-publico/formatMp";

export default function CompraAgilVisualizer() {
    const { data, loading, error, total } = useMercadoPublico("compra-agil");
    const [busqueda, setBusqueda] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState("");
    const [regionFiltro, setRegionFiltro] = useState("");
    const [orden, setOrden] = useState("");
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

    const regiones = useMemo(() => {
        const values = dataActualizada.map((d) => d.region).filter(Boolean);
        return [...new Set(values)].sort();
    }, [dataActualizada]);

    const filas = useMemo(() => {
        const filtradas = dataActualizada.filter((row) => {
            const nombre = row.nombre ?? "";
            const codigo = row.codigo ?? "";
            const organismo = row.organismo ?? "";
            const estado = row.estado ?? "";
            const region = row.region ?? "";

            const q = busqueda.toLowerCase();
            const textMatch =
                !q ||
                nombre.toLowerCase().includes(q) ||
                codigo.toLowerCase().includes(q) ||
                organismo.toLowerCase().includes(q);

            const estadoMatch = !estadoFiltro || estado === estadoFiltro;
            const regionMatch = !regionFiltro || region === regionFiltro;

            return textMatch && estadoMatch && regionMatch;
        });

        return ordenarFilasMp(filtradas, orden, "monto");
    }, [dataActualizada, busqueda, estadoFiltro, regionFiltro, orden]);

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
            label: "Nombre",
            render: (row) => {
                const nombre = row.nombre ?? "—";
                return (
                    <span
                        style={{
                            display: "block",
                            maxWidth: "220px",
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
            key: "estado",
            label: "Estado",
            render: (row) => <EstadoBadge estado={row.estado} />,
        },
        {
            key: "region",
            label: "Región",
            render: (row) => {
                const region = row.region ?? "—";
                return (
                    <span
                        style={{
                            display: "block",
                            maxWidth: "140px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "var(--text-muted)",
                            fontSize: "0.78rem",
                            minWidth: 0,
                        }}
                        title={region}
                    >
                        {region}
                    </span>
                );
            },
        },
        {
            key: "fechaCierre",
            label: "Cierre",
            render: (row) => (
                <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                    {formatFechaMp(row.fechaCierre)}
                </span>
            ),
        },
        {
            key: "monto",
            label: "Monto",
            render: (row) => (
                <span style={{ color: "var(--accent)", fontWeight: 600, fontFamily: "monospace" }}>
                    {formatMoneyMp(row.monto)}
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
                <h1
                    className="text-2xl font-extrabold sm:text-[1.8rem]"
                    style={{
                        margin: 0,
                        color: "var(--text-secondary)",
                    }}
                >
                    Compra Ágil
                </h1>
                <p
                    style={{
                        margin: 0,
                        marginTop: "0.45rem",
                        color: "var(--text-muted)",
                        fontSize: "0.92rem",
                        maxWidth: "60ch",
                    }}
                >
                    Compras ágiles sincronizadas desde Mercado Público
                </p>
            </div>

            <div className="kpi-grid kpi-grid--4">
                {[
                    { label: "Registros", value: total ?? dataActualizada.length ?? 0 },
                    { label: "Filtrados", value: filas.length },
                    { label: "Estados", value: estados.length },
                    { label: "Regiones", value: regiones.length },
                ].map((item) => (
                    <div key={item.label} className="kpi-card">
                        <p className="kpi-card-label">{item.label}</p>
                        <p className="kpi-card-value">{item.value}</p>
                    </div>
                ))}
            </div>
            <AvisoDesdeDb visible loading={loading} hayFilas={data.length > 0} error={error} />

            {!loading && (
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
                        placeholder="Buscar por nombre, código u organismo..."
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
                        className="min-w-0 flex-1 basis-[calc(50%-0.375rem)] sm:basis-36 sm:min-w-[130px]"
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
                        value={regionFiltro}
                        onChange={(e) => setRegionFiltro(e.target.value)}
                        className="min-w-0 flex-1 basis-[calc(50%-0.375rem)] sm:basis-36 sm:min-w-[130px]"
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
                        <option value="">Todas las regiones</option>
                        {regiones.map((r) => (
                            <option key={r} value={r}>
                                {r}
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

                    {(busqueda || estadoFiltro || regionFiltro) && (
                        <button
                            onClick={() => {
                                setBusqueda("");
                                setEstadoFiltro("");
                                setRegionFiltro("");
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
                <SkeletonTabla filas={8} columnas={7} />
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
                        Sin resultados
                    </p>
                    <p style={{ margin: 0, fontSize: "0.84rem" }}>
                        {busqueda || estadoFiltro || regionFiltro
                            ? "No hay registros que coincidan con los filtros aplicados."
                            : "No hay compras ágiles en Supabase todavía."}
                    </p>
                </div>
            ) : (
                <MercadoPublicoTable
                    columns={columns}
                    rows={filas}
                    onVerDetalle={setDetalleAbierto}
                    emptyMessage="Sin registros disponibles."
                    labelPlural="compras ágiles"
                />
            )}

            {detalleAbierto && (
                <MercadoPublicoDetalleModal
                    row={parches[detalleAbierto.codigo] ?? detalleAbierto}
                    modulo="compra-agil"
                    onClose={() => setDetalleAbierto(null)}
                    onDetalleCargado={onDetalleCargado}
                />
            )}
        </section>
    );
}