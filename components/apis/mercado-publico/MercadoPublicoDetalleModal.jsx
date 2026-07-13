"use client";

import { useEffect, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { tieneDetalleEnPayload } from "@/services/mercado-publico/mercadoPublicoMapper";

function Campo({ label, valor }) {
    return (
        <div className="min-w-0">
            <p style={{
                color: "var(--text-muted)",
                fontSize: "0.65rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "2px",
            }}>
                {label}
            </p>
            <p className="break-words" style={{ color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem" }}>
                {valor ?? "—"}
            </p>
        </div>
    );
}

function Seccion({ titulo, children }) {
    return (
        <div style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "1rem",
            minWidth: 0,
        }}>
            <p style={{
                margin: 0,
                marginBottom: "0.75rem",
                color: "var(--accent)",
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
            }}>
                {titulo}
            </p>
            {children}
        </div>
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

function formatFecha(valor) {
    if (!valor) return "—";
    const normalizado = String(valor).replace(" ", "T");
    const fecha = new Date(normalizado);
    if (isNaN(fecha.getTime())) return valor;
    return fecha.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function extraerItemsOc(raw) {
    const listado = raw?.Items?.Listado ?? raw?.items?.listado ?? [];
    return Array.isArray(listado) ? listado : [];
}

function itemsLicitacionDesdeFila(fila, raw) {
    if (Array.isArray(fila?.items) && fila.items.length > 0) {
        return fila.items;
    }
    return extraerItemsOc(raw).map((it) => ({
        codigoProducto: it.CodigoProducto ?? null,
        nombreProducto: it.NombreProducto ?? null,
        descripcion: it.Descripcion ?? null,
        cantidad: it.Cantidad ?? null,
    }));
}

function itemsOrdenCompraDesdeFila(fila, raw) {
    if (Array.isArray(fila?.items) && fila.items.length > 0) {
        return fila.items;
    }
    return extraerItemsOc(raw).map((it) => ({
        codigoProducto: it.CodigoProducto ?? null,
        producto: it.Producto ?? null,
        especificacionComprador: it.EspecificacionComprador ?? null,
        cantidad: it.Cantidad ?? null,
        precioNeto: it.PrecioNeto ?? null,
        totalImpuestos: it.TotalImpuestos ?? null,
        total: it.Total ?? null,
    }));
}

function productosCompraAgilDesdeFila(fila, raw) {
    if (Array.isArray(fila?.productos) && fila.productos.length > 0) {
        return fila.productos;
    }
    const listado = raw?.productos_solicitados ?? [];
    if (!Array.isArray(listado)) return [];
    return listado.map((p) => ({
        codigoProducto: p.codigo_producto ?? null,
        nombre: p.nombre ?? null,
        descripcion: p.descripcion ?? null,
        cantidad: p.cantidad ?? null,
    }));
}

const TITULOS = {
    licitaciones: "Detalle de licitación",
    "ordenes-compra": "Detalle de orden de compra",
    "compra-agil": "Detalle de compra ágil",
};

const ENLACES_MERCADO_PUBLICO = {
    licitaciones: {
        label: "Ver en Mercado Público",
        href: "https://www.mercadopublico.cl/home/busquedalicitacion",
    },
    "ordenes-compra": {
        label: "Ver en Mercado Público",
        href: "https://www.mercadopublico.cl/Portal/Modules/Site/Busquedas/BuscadorAvanzado.aspx?qs=2",
    },
    "compra-agil": {
        label: "Ver Anexos en MercadoPublico",
        href: (codigo) => `https://buscador.mercadopublico.cl/ficha?code=${encodeURIComponent(codigo)}`,
    },
};

function BotonMercadoPublico({ modulo, codigo }) {
    const config = ENLACES_MERCADO_PUBLICO[modulo];
    if (!config) return null;

    const href = typeof config.href === "function" ? config.href(codigo) : config.href;
    if (!href) return null;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                alignSelf: "flex-start",
                background: "color-mix(in srgb, var(--accent) 10%, var(--surface-2))",
                border: "1px solid color-mix(in srgb, var(--accent) 35%, var(--border))",
                color: "var(--accent)",
                padding: "0.55rem 1rem",
                borderRadius: "8px",
                fontSize: "0.8rem",
                fontWeight: 600,
                textDecoration: "none",
            }}
        >
            <ExternalLink size={14} />
            {config.label}
        </a>
    );
}

export default function MercadoPublicoDetalleModal({ row, modulo, onClose, onDetalleCargado }) {
    const [fila, setFila] = useState(row);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setFila(row);
        setError(null);
    }, [row]);

    const codigo = fila?.codigo ?? fila?.CodigoExterno ?? fila?.Codigo;

    useEffect(() => {
        if (!codigo || !modulo) return;

        const payload = fila?.payload ?? fila?._raw;
        if (tieneDetalleEnPayload(modulo, payload)) return;

        let cancelado = false;

        async function cargar() {
            setCargando(true);
            setError(null);
            try {
                const res = await fetch(
                    `/api/mercado-publico/detalle?modulo=${encodeURIComponent(modulo)}&codigo=${encodeURIComponent(codigo)}`
                );
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || "Error cargando detalle");
                if (!cancelado) {
                    setFila(json.fila);
                    onDetalleCargado?.(json.fila);
                }
            } catch (e) {
                if (!cancelado) setError(e.message);
            } finally {
                if (!cancelado) setCargando(false);
            }
        }

        cargar();
        return () => {
            cancelado = true;
        };
    }, [codigo, modulo, fila?.payload, fila?._raw]);

    if (!fila) return null;

    const raw = fila.payload ?? fila._raw ?? {};
    const sinDetalle = !tieneDetalleEnPayload(modulo, raw);
    const titulo = fila.nombre ?? fila.Nombre ?? raw.Nombre ?? raw.nombre ?? codigo;
    const itemsOc = itemsOrdenCompraDesdeFila(fila, raw);
    const itemsLicitacion = itemsLicitacionDesdeFila(fila, raw);
    const productosCa = productosCompraAgilDesdeFila(fila, raw);
    const presupuestoCa = raw.presupuesto ?? raw.montos ?? {};
    const convocatoriaCa = raw.convocatoria ?? {};
    const fechasCa = raw.fechas ?? {};
    const entregaCa = raw.entrega ?? {};
    const institucionCa = raw.institucion ?? {};
    const resumenCa = raw.resumen ?? {};

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.72)",
                    backdropFilter: "blur(5px)",
                    zIndex: 50,
                }}
            />
            <div
                className="fixed left-1/2 top-1/2 z-[51] flex w-[min(760px,95vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[18px]"
                style={{
                    maxHeight: "92dvh",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
                }}
            >
                <div
                    className="flex shrink-0 items-start justify-between gap-3 px-4 py-3 sm:px-6 sm:py-5"
                    style={{
                        borderBottom: "1px solid var(--border)",
                        background: "var(--surface-2)",
                    }}
                >
                    <div className="min-w-0">
                        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.7rem", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                            {TITULOS[modulo] ?? "Detalle"}
                        </p>
                        <p className="truncate" style={{ margin: 0, marginTop: "4px", color: "var(--accent)", fontSize: "0.8rem", fontFamily: "monospace" }} title={codigo}>
                            {codigo}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="shrink-0"
                        style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4 sm:p-6">
                    {cargando && (
                        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem" }}>
                            Cargando detalle desde Mercado Público…
                        </p>
                    )}
                    {error && (
                        <p style={{ margin: 0, color: "var(--warning)", fontSize: "0.82rem" }}>
                            {error}
                        </p>
                    )}
                    {!cargando && sinDetalle && !error && (
                        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem" }}>
                            Detalle no disponible. El cron en segundo plano también intentará enriquecerlo.
                        </p>
                    )}

                    <h2 className="break-words text-lg font-extrabold leading-snug sm:text-xl" style={{ margin: 0, color: "var(--text-secondary)" }}>
                        {titulo}
                    </h2>

                    <BotonMercadoPublico modulo={modulo} codigo={codigo} />

                    {modulo === "licitaciones" && (
                        <>
                            <Seccion titulo="Identificación">
                                <div className="modal-grid-2">
                                    <Campo label="Código externo" valor={fila.codigo ?? raw.CodigoExterno} />
                                    <Campo label="Estado" valor={fila.estado ?? raw.Estado} />
                                    <Campo label="Monto estimado" valor={formatMoney(fila.montoEstimado ?? raw.MontoEstimado)} />
                                    <Campo label="Moneda" valor={fila.moneda ?? raw.Moneda ?? "CLP"} />
                                </div>
                            </Seccion>

                            {(fila.descripcion ?? raw.Descripcion) && (
                                <Seccion titulo="Descripción">
                                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                                        {fila.descripcion ?? raw.Descripcion}
                                    </p>
                                </Seccion>
                            )}

                            <Seccion titulo="Organismo comprador">
                                <div className="modal-grid-2">
                                    <Campo label="Nombre organismo" valor={fila.organismo ?? raw.Comprador?.NombreOrganismo} />
                                    <Campo label="Nombre unidad" valor={fila.nombreUnidad ?? raw.Comprador?.NombreUnidad} />
                                    <Campo label="Dirección unidad" valor={fila.direccionUnidad ?? raw.Comprador?.DireccionUnidad} />
                                    <Campo label="Región unidad" valor={fila.regionUnidad ?? raw.Comprador?.RegionUnidad} />
                                </div>
                            </Seccion>

                            <Seccion titulo="Plazos y reclamos">
                                <div className="modal-grid-2">
                                    <Campo label="Fecha inicio" valor={formatFecha(fila.fechaInicio ?? raw.Fechas?.FechaInicio)} />
                                    <Campo label="Fecha final" valor={formatFecha(fila.fechaFinal ?? raw.Fechas?.FechaFinal)} />
                                    <Campo label="Fecha cierre" valor={formatFecha(fila.fechaCierre ?? raw.Fechas?.FechaCierre ?? raw.FechaCierre)} />
                                    <Campo
                                        label="Cantidad de reclamos"
                                        valor={
                                            fila.cantidadReclamos ?? raw.CantidadReclamos ?? "—"
                                        }
                                    />
                                </div>
                            </Seccion>

                            {itemsLicitacion.length > 0 && (
                                <Seccion titulo="Ítems de la licitación">
                                    <div style={{ overflowX: "auto" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                                            <thead>
                                                <tr>
                                                    {["Código producto", "Nombre producto", "Descripción", "Cantidad"].map((h) => (
                                                        <th
                                                            key={h}
                                                            style={{
                                                                padding: "0.5rem 0.75rem",
                                                                textAlign: "left",
                                                                color: "var(--text-muted)",
                                                                borderBottom: "1px solid var(--border)",
                                                            }}
                                                        >
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {itemsLicitacion.map((item, i) => (
                                                    <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                                                        <td style={{ padding: "0.5rem 0.75rem", fontFamily: "monospace", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                                                            {item.codigoProducto ?? "—"}
                                                        </td>
                                                        <td style={{ padding: "0.5rem 0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                                                            {item.nombreProducto ?? "—"}
                                                        </td>
                                                        <td style={{ padding: "0.5rem 0.75rem", color: "var(--text-muted)", maxWidth: "280px" }}>
                                                            {item.descripcion ?? "—"}
                                                        </td>
                                                        <td style={{ padding: "0.5rem 0.75rem", color: "var(--text-secondary)" }}>
                                                            {item.cantidad ?? "—"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Seccion>
                            )}
                        </>
                    )}

                    {modulo === "ordenes-compra" && (
                        <>
                            <Seccion titulo="Identificación">
                                <div className="modal-grid-2">
                                    <Campo label="Código" valor={fila.codigo ?? raw.Codigo} />
                                    <Campo label="Estado" valor={fila.estado ?? raw.Estado} />
                                    <Campo label="Código licitación" valor={fila.codigoLicitacion ?? raw.CodigoLicitacion} />
                                    <Campo label="Total neto" valor={formatMoney(fila.totalNeto ?? raw.TotalNeto)} />
                                    <Campo label="Impuestos" valor={formatMoney(fila.impuestos ?? raw.Impuestos)} />
                                    <Campo label="Total" valor={formatMoney(fila.total ?? raw.Total ?? fila.montoTotal)} />
                                </div>
                            </Seccion>

                            {(fila.descripcion ?? raw.Descripcion) && (
                                <Seccion titulo="Descripción">
                                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                                        {fila.descripcion ?? raw.Descripcion}
                                    </p>
                                </Seccion>
                            )}

                            <Seccion titulo="Comprador">
                                <div className="modal-grid-2">
                                    <Campo label="Nombre organismo" valor={fila.comprador ?? raw.Comprador?.NombreOrganismo} />
                                    <Campo label="Nombre unidad" valor={fila.nombreUnidad ?? raw.Comprador?.NombreUnidad} />
                                    <Campo label="Actividad" valor={fila.actividadComprador ?? raw.Comprador?.Actividad} />
                                    <Campo label="Dirección unidad" valor={fila.direccionUnidad ?? raw.Comprador?.DireccionUnidad} />
                                    <Campo label="Comuna unidad" valor={fila.comunaUnidad ?? raw.Comprador?.ComunaUnidad} />
                                    <Campo label="Región unidad" valor={(fila.regionUnidad ?? raw.Comprador?.RegionUnidad ?? "").trim() || "—"} />
                                </div>
                            </Seccion>

                            <Seccion titulo="Proveedor">
                                <div className="modal-grid-2">
                                    <Campo label="Nombre" valor={fila.proveedor ?? raw.Proveedor?.Nombre} />
                                    <Campo label="Actividad" valor={fila.actividadProveedor ?? raw.Proveedor?.Actividad} />
                                    <Campo label="Dirección" valor={fila.direccionProveedor ?? raw.Proveedor?.Direccion} />
                                    <Campo label="Comuna" valor={fila.comunaProveedor ?? raw.Proveedor?.Comuna} />
                                    <Campo label="Región" valor={(fila.regionProveedor ?? raw.Proveedor?.Region ?? "").trim() || "—"} />
                                </div>
                            </Seccion>

                            {itemsOc.length > 0 && (
                                <Seccion titulo={`Ítems (${fila.cantidadItems ?? raw.Items?.Cantidad ?? itemsOc.length})`}>
                                    <div style={{ overflowX: "auto" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                                            <thead>
                                                <tr>
                                                    {["Código producto", "Producto", "Especificación comprador", "Cantidad", "Precio neto", "Total impuestos", "Total"].map((h) => (
                                                        <th
                                                            key={h}
                                                            style={{
                                                                padding: "0.5rem 0.75rem",
                                                                textAlign: "left",
                                                                color: "var(--text-muted)",
                                                                borderBottom: "1px solid var(--border)",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {itemsOc.map((item, i) => (
                                                    <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                                                        <td style={{ padding: "0.5rem 0.75rem", fontFamily: "monospace", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                                                            {item.codigoProducto ?? "—"}
                                                        </td>
                                                        <td style={{ padding: "0.5rem 0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                                                            {item.producto ?? "—"}
                                                        </td>
                                                        <td style={{ padding: "0.5rem 0.75rem", color: "var(--text-muted)", maxWidth: "200px", whiteSpace: "pre-wrap" }}>
                                                            {item.especificacionComprador ?? "—"}
                                                        </td>
                                                        <td style={{ padding: "0.5rem 0.75rem", color: "var(--text-secondary)" }}>
                                                            {item.cantidad ?? "—"}
                                                        </td>
                                                        <td style={{ padding: "0.5rem 0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                                                            {formatMoney(item.precioNeto)}
                                                        </td>
                                                        <td style={{ padding: "0.5rem 0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                                                            {formatMoney(item.totalImpuestos)}
                                                        </td>
                                                        <td style={{ padding: "0.5rem 0.75rem", color: "var(--accent)", fontFamily: "monospace" }}>
                                                            {formatMoney(item.total)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Seccion>
                            )}
                        </>
                    )}

                    {modulo === "compra-agil" && (
                        <>
                            <Seccion titulo="Identificación">
                                <div className="modal-grid-2">
                                    <Campo label="Código" valor={fila.codigo ?? raw.codigo} />
                                    <Campo label="Estado" valor={fila.estado ?? raw.estado?.glosa ?? raw.estado?.codigo} />
                                    <Campo
                                        label="Presupuesto estimado"
                                        valor={formatMoney(
                                            fila.monto ??
                                            presupuestoCa.presupuesto_estimado ??
                                            presupuestoCa.monto_disponible_clp
                                        )}
                                    />
                                    <Campo label="Moneda" valor={fila.moneda ?? presupuestoCa.moneda ?? "CLP"} />
                                </div>
                            </Seccion>

                            {(fila.descripcion ?? raw.descripcion) && (
                                <Seccion titulo="Descripción">
                                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                                        {fila.descripcion ?? raw.descripcion}
                                    </p>
                                </Seccion>
                            )}

                            <Seccion titulo="Convocatoria">
                                <div className="modal-grid-2">
                                    <Campo
                                        label="Estado convocatoria"
                                        valor={fila.estadoConvocatoria ?? convocatoriaCa.descripcion}
                                    />
                                    <Campo
                                        label="Total ofertas recibidas"
                                        valor={fila.totalOfertasRecibidas ?? resumenCa.total_ofertas_recibidas ?? "—"}
                                    />
                                    <Campo
                                        label="Cierre primer llamado"
                                        valor={formatFecha(fila.fechaCierrePrimerLlamado ?? convocatoriaCa.fecha_cierre_primer_llamado)}
                                    />
                                    <Campo
                                        label="Cierre segundo llamado"
                                        valor={formatFecha(fila.fechaCierreSegundoLlamado ?? convocatoriaCa.fecha_cierre_segundo_llamado)}
                                    />
                                </div>
                            </Seccion>

                            <Seccion titulo="Fechas">
                                <div className="modal-grid-2">
                                    <Campo
                                        label="Fecha publicación"
                                        valor={formatFecha(fila.fechaCreacion ?? fechasCa.fecha_publicacion)}
                                    />
                                    <Campo
                                        label="Fecha cierre"
                                        valor={formatFecha(fila.fechaCierre ?? fechasCa.fecha_cierre)}
                                    />
                                    {(fila.fechaCancelacion ?? fechasCa.fecha_cancelacion) && (
                                        <Campo
                                            label="Fecha cancelación"
                                            valor={formatFecha(fila.fechaCancelacion ?? fechasCa.fecha_cancelacion)}
                                        />
                                    )}
                                </div>
                            </Seccion>

                            <Seccion titulo="Entrega">
                                <div className="modal-grid-2">
                                    <Campo
                                        label="Dirección de entrega"
                                        valor={fila.direccionEntrega ?? entregaCa.direccion_entrega}
                                    />
                                    <Campo
                                        label="Plazo entrega (días)"
                                        valor={fila.plazoEntregaDias ?? entregaCa.plazo_entrega_dias ?? "—"}
                                    />
                                </div>
                            </Seccion>

                            <Seccion titulo="Organismo comprador">
                                <div className="modal-grid-2">
                                    <Campo
                                        label="Organismo"
                                        valor={fila.organismo ?? institucionCa.organismo_comprador}
                                    />
                                    <Campo
                                        label="Región"
                                        valor={(fila.region ?? institucionCa.nombre_region ?? "").trim() || "—"}
                                    />
                                </div>
                            </Seccion>

                            {productosCa.length > 0 && (
                                <Seccion titulo="Productos solicitados">
                                    <div style={{ overflowX: "auto" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                                            <thead>
                                                <tr>
                                                    {["Código producto", "Nombre", "Descripción", "Cantidad"].map((h) => (
                                                        <th
                                                            key={h}
                                                            style={{
                                                                padding: "0.5rem 0.75rem",
                                                                textAlign: "left",
                                                                color: "var(--text-muted)",
                                                                borderBottom: "1px solid var(--border)",
                                                            }}
                                                        >
                                                            {h}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {productosCa.map((item, i) => (
                                                    <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                                                        <td style={{ padding: "0.5rem 0.75rem", fontFamily: "monospace", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                                                            {item.codigoProducto ?? "—"}
                                                        </td>
                                                        <td style={{ padding: "0.5rem 0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                                                            {item.nombre ?? "—"}
                                                        </td>
                                                        <td style={{ padding: "0.5rem 0.75rem", color: "var(--text-muted)", maxWidth: "280px", whiteSpace: "pre-wrap" }}>
                                                            {item.descripcion ?? "—"}
                                                        </td>
                                                        <td style={{ padding: "0.5rem 0.75rem", color: "var(--text-secondary)" }}>
                                                            {item.cantidad ?? "—"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Seccion>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}