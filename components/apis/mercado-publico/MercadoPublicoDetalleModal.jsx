"use client";

import { ExternalLink, X } from "lucide-react";
import { tieneDetalleEnPayload } from "@/services/mercado-publico/mercadoPublicoMapper";

function Campo({ label, valor }) {
    return (
        <div>
            <p style={{
                color: "var(--text-muted)",
                fontSize: "0.65rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "2px",
            }}>
                {label}
            </p>
            <p style={{ color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem" }}>
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

const grid2 = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1rem",
};

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

export default function MercadoPublicoDetalleModal({ row, modulo, onClose }) {
    if (!row) return null;

    const raw = row.payload ?? row._raw ?? {};
    const codigo = row.codigo ?? row.CodigoExterno ?? row.Codigo;
    const sinDetalle = !tieneDetalleEnPayload(modulo, raw);
    const titulo = row.nombre ?? row.Nombre ?? raw.Nombre ?? raw.nombre ?? codigo;
    const itemsOc = itemsOrdenCompraDesdeFila(row, raw);
    const itemsLicitacion = itemsLicitacionDesdeFila(row, raw);
    const productosCa = productosCompraAgilDesdeFila(row, raw);
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
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "min(760px, 95vw)",
                    maxHeight: "92vh",
                    overflowY: "auto",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "18px",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
                    zIndex: 51,
                }}
            >
                <div style={{
                    padding: "1.2rem 1.5rem",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--surface-2)",
                    borderRadius: "18px 18px 0 0",
                }}>
                    <div>
                        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.7rem", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                            {TITULOS[modulo] ?? "Detalle"}
                        </p>
                        <p style={{ margin: 0, marginTop: "4px", color: "var(--accent)", fontSize: "0.8rem", fontFamily: "monospace" }}>
                            {codigo}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {sinDetalle && (
                        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem" }}>
                            Detalle completo pendiente. Se enriquece periódicamente desde Mercado Público vía cron.
                        </p>
                    )}

                    <h2 style={{ margin: 0, color: "var(--text-secondary)", fontSize: "1.2rem", fontWeight: 800, lineHeight: 1.3 }}>
                        {titulo}
                    </h2>

                    <BotonMercadoPublico modulo={modulo} codigo={codigo} />

                    {modulo === "licitaciones" && (
                        <>
                            <Seccion titulo="Identificación">
                                <div style={grid2}>
                                    <Campo label="Código externo" valor={row.codigo ?? raw.CodigoExterno} />
                                    <Campo label="Estado" valor={row.estado ?? raw.Estado} />
                                    <Campo label="Monto estimado" valor={formatMoney(row.montoEstimado ?? raw.MontoEstimado)} />
                                    <Campo label="Moneda" valor={row.moneda ?? raw.Moneda ?? "CLP"} />
                                </div>
                            </Seccion>

                            {(row.descripcion ?? raw.Descripcion) && (
                                <Seccion titulo="Descripción">
                                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                                        {row.descripcion ?? raw.Descripcion}
                                    </p>
                                </Seccion>
                            )}

                            <Seccion titulo="Organismo comprador">
                                <div style={grid2}>
                                    <Campo label="Nombre organismo" valor={row.organismo ?? raw.Comprador?.NombreOrganismo} />
                                    <Campo label="Nombre unidad" valor={row.nombreUnidad ?? raw.Comprador?.NombreUnidad} />
                                    <Campo label="Dirección unidad" valor={row.direccionUnidad ?? raw.Comprador?.DireccionUnidad} />
                                    <Campo label="Región unidad" valor={row.regionUnidad ?? raw.Comprador?.RegionUnidad} />
                                </div>
                            </Seccion>

                            <Seccion titulo="Plazos y reclamos">
                                <div style={grid2}>
                                    <Campo label="Fecha inicio" valor={formatFecha(row.fechaInicio ?? raw.Fechas?.FechaInicio)} />
                                    <Campo label="Fecha final" valor={formatFecha(row.fechaFinal ?? raw.Fechas?.FechaFinal)} />
                                    <Campo label="Fecha cierre" valor={formatFecha(row.fechaCierre ?? raw.Fechas?.FechaCierre ?? raw.FechaCierre)} />
                                    <Campo
                                        label="Cantidad de reclamos"
                                        valor={
                                            row.cantidadReclamos ?? raw.CantidadReclamos ?? "—"
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
                                <div style={grid2}>
                                    <Campo label="Código" valor={row.codigo ?? raw.Codigo} />
                                    <Campo label="Estado" valor={row.estado ?? raw.Estado} />
                                    <Campo label="Código licitación" valor={row.codigoLicitacion ?? raw.CodigoLicitacion} />
                                    <Campo label="Total neto" valor={formatMoney(row.totalNeto ?? raw.TotalNeto)} />
                                    <Campo label="Impuestos" valor={formatMoney(row.impuestos ?? raw.Impuestos)} />
                                    <Campo label="Total" valor={formatMoney(row.total ?? raw.Total ?? row.montoTotal)} />
                                </div>
                            </Seccion>

                            {(row.descripcion ?? raw.Descripcion) && (
                                <Seccion titulo="Descripción">
                                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                                        {row.descripcion ?? raw.Descripcion}
                                    </p>
                                </Seccion>
                            )}

                            <Seccion titulo="Comprador">
                                <div style={grid2}>
                                    <Campo label="Nombre organismo" valor={row.comprador ?? raw.Comprador?.NombreOrganismo} />
                                    <Campo label="Nombre unidad" valor={row.nombreUnidad ?? raw.Comprador?.NombreUnidad} />
                                    <Campo label="Actividad" valor={row.actividadComprador ?? raw.Comprador?.Actividad} />
                                    <Campo label="Dirección unidad" valor={row.direccionUnidad ?? raw.Comprador?.DireccionUnidad} />
                                    <Campo label="Comuna unidad" valor={row.comunaUnidad ?? raw.Comprador?.ComunaUnidad} />
                                    <Campo label="Región unidad" valor={(row.regionUnidad ?? raw.Comprador?.RegionUnidad ?? "").trim() || "—"} />
                                </div>
                            </Seccion>

                            <Seccion titulo="Proveedor">
                                <div style={grid2}>
                                    <Campo label="Nombre" valor={row.proveedor ?? raw.Proveedor?.Nombre} />
                                    <Campo label="Actividad" valor={row.actividadProveedor ?? raw.Proveedor?.Actividad} />
                                    <Campo label="Dirección" valor={row.direccionProveedor ?? raw.Proveedor?.Direccion} />
                                    <Campo label="Comuna" valor={row.comunaProveedor ?? raw.Proveedor?.Comuna} />
                                    <Campo label="Región" valor={(row.regionProveedor ?? raw.Proveedor?.Region ?? "").trim() || "—"} />
                                </div>
                            </Seccion>

                            {itemsOc.length > 0 && (
                                <Seccion titulo={`Ítems (${row.cantidadItems ?? raw.Items?.Cantidad ?? itemsOc.length})`}>
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
                                <div style={grid2}>
                                    <Campo label="Código" valor={row.codigo ?? raw.codigo} />
                                    <Campo label="Estado" valor={row.estado ?? raw.estado?.glosa ?? raw.estado?.codigo} />
                                    <Campo
                                        label="Presupuesto estimado"
                                        valor={formatMoney(
                                            row.monto ??
                                            presupuestoCa.presupuesto_estimado ??
                                            presupuestoCa.monto_disponible_clp
                                        )}
                                    />
                                    <Campo label="Moneda" valor={row.moneda ?? presupuestoCa.moneda ?? "CLP"} />
                                </div>
                            </Seccion>

                            {(row.descripcion ?? raw.descripcion) && (
                                <Seccion titulo="Descripción">
                                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                                        {row.descripcion ?? raw.descripcion}
                                    </p>
                                </Seccion>
                            )}

                            <Seccion titulo="Convocatoria">
                                <div style={grid2}>
                                    <Campo
                                        label="Estado convocatoria"
                                        valor={row.estadoConvocatoria ?? convocatoriaCa.descripcion}
                                    />
                                    <Campo
                                        label="Total ofertas recibidas"
                                        valor={row.totalOfertasRecibidas ?? resumenCa.total_ofertas_recibidas ?? "—"}
                                    />
                                    <Campo
                                        label="Cierre primer llamado"
                                        valor={formatFecha(row.fechaCierrePrimerLlamado ?? convocatoriaCa.fecha_cierre_primer_llamado)}
                                    />
                                    <Campo
                                        label="Cierre segundo llamado"
                                        valor={formatFecha(row.fechaCierreSegundoLlamado ?? convocatoriaCa.fecha_cierre_segundo_llamado)}
                                    />
                                </div>
                            </Seccion>

                            <Seccion titulo="Fechas">
                                <div style={grid2}>
                                    <Campo
                                        label="Fecha publicación"
                                        valor={formatFecha(row.fechaCreacion ?? fechasCa.fecha_publicacion)}
                                    />
                                    <Campo
                                        label="Fecha cierre"
                                        valor={formatFecha(row.fechaCierre ?? fechasCa.fecha_cierre)}
                                    />
                                    {(row.fechaCancelacion ?? fechasCa.fecha_cancelacion) && (
                                        <Campo
                                            label="Fecha cancelación"
                                            valor={formatFecha(row.fechaCancelacion ?? fechasCa.fecha_cancelacion)}
                                        />
                                    )}
                                </div>
                            </Seccion>

                            <Seccion titulo="Entrega">
                                <div style={grid2}>
                                    <Campo
                                        label="Dirección de entrega"
                                        valor={row.direccionEntrega ?? entregaCa.direccion_entrega}
                                    />
                                    <Campo
                                        label="Plazo entrega (días)"
                                        valor={row.plazoEntregaDias ?? entregaCa.plazo_entrega_dias ?? "—"}
                                    />
                                </div>
                            </Seccion>

                            <Seccion titulo="Organismo comprador">
                                <div style={grid2}>
                                    <Campo
                                        label="Organismo"
                                        valor={row.organismo ?? institucionCa.organismo_comprador}
                                    />
                                    <Campo
                                        label="Región"
                                        valor={(row.region ?? institucionCa.nombre_region ?? "").trim() || "—"}
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