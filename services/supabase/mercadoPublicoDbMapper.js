import { normalizarRegion } from "@/utils/normalizarRegion";

function aFechaIso(valor) {
    if (!valor) return null;
    const normalizado = String(valor).replace(" ", "T");
    const d = new Date(normalizado);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function licitacionUiADb(fila) {
    return {
        codigo: fila.codigo,
        nombre: fila.nombre ?? null,
        estado: fila.estado ?? null,
        organismo: fila.organismo ?? null,
        nombre_unidad: fila.nombreUnidad ?? null,
        direccion_unidad: fila.direccionUnidad ?? null,
        region_unidad: fila.regionUnidad ?? null,
        cantidad_reclamos: fila.cantidadReclamos ?? null,
        fecha_cierre: aFechaIso(fila.fechaCierre),
        fecha_creacion: aFechaIso(fila.fechaCreacion),
        fecha_inicio: aFechaIso(fila.fechaInicio),
        fecha_final: aFechaIso(fila.fechaFinal),
        monto_estimado: fila.montoEstimado ?? null,
        moneda: fila.moneda ?? "CLP",
        descripcion: fila.descripcion ?? null,
        items: fila.items ?? [],
        payload: fila._raw ?? null,
        sincronizado_en: new Date().toISOString(),
    };
}

export function licitacionDbAUi(row) {
    return {
        id: row.codigo,
        codigo: row.codigo,
        nombre: row.nombre ?? "Sin nombre",
        estado: row.estado ?? "Sin estado",
        organismo: row.organismo ?? "Sin organismo",
        nombreUnidad: row.nombre_unidad ?? null,
        direccionUnidad: row.direccion_unidad ?? null,
        regionUnidad: row.region_unidad ?? null,
        cantidadReclamos: row.cantidad_reclamos ?? null,
        fechaCierre: row.fecha_cierre,
        fechaCreacion: row.fecha_creacion,
        fechaInicio: row.fecha_inicio,
        fechaFinal: row.fecha_final,
        montoEstimado: row.monto_estimado ?? null,
        moneda: row.moneda ?? "CLP",
        descripcion: row.descripcion ?? null,
        items: row.items ?? [],
        payload: row.payload ?? null,
        _raw: row.payload ?? null,
    };
}

// Sin payload ni items: liviano para listar decenas de miles de filas.
export const COLUMNAS_LISTADO_ORDEN_COMPRA =
    "codigo, nombre, proveedor, comprador, monto_total, moneda, fecha, estado, " +
    "codigo_licitacion, descripcion, total_neto, impuestos, total, " +
    "nombre_unidad, actividad_comprador, direccion_unidad, comuna_unidad, region_unidad, " +
    "actividad_proveedor, direccion_proveedor, comuna_proveedor, region_proveedor, " +
    "cantidad_items, sincronizado_en";

export function ordenCompraUiADb(fila) {
    return {
        codigo: fila.codigo,
        nombre: fila.nombre ?? null,
        proveedor: fila.proveedor ?? null,
        comprador: fila.comprador ?? null,
        monto_total: fila.montoTotal ?? fila.total ?? 0,
        moneda: fila.moneda ?? "CLP",
        fecha: aFechaIso(fila.fecha),
        estado: fila.estado ?? null,
        codigo_licitacion: fila.codigoLicitacion ?? null,
        descripcion: fila.descripcion ?? null,
        total_neto: fila.totalNeto ?? null,
        impuestos: fila.impuestos ?? null,
        total: fila.total ?? null,
        nombre_unidad: fila.nombreUnidad ?? null,
        actividad_comprador: fila.actividadComprador ?? null,
        direccion_unidad: fila.direccionUnidad ?? null,
        comuna_unidad: fila.comunaUnidad ?? null,
        region_unidad: fila.regionUnidad ?? null,
        actividad_proveedor: fila.actividadProveedor ?? null,
        direccion_proveedor: fila.direccionProveedor ?? null,
        comuna_proveedor: fila.comunaProveedor ?? null,
        region_proveedor: fila.regionProveedor ?? null,
        cantidad_items: fila.cantidadItems ?? null,
        items: fila.items ?? [],
        payload: fila._raw ?? null,
        sincronizado_en: new Date().toISOString(),
    };
}

export function ordenCompraDbAUi(row) {
    return {
        id: row.codigo,
        codigo: row.codigo,
        nombre: row.nombre ?? null,
        proveedor: row.proveedor ?? "Sin proveedor",
        comprador: row.comprador ?? "Sin organismo",
        montoTotal: row.monto_total ?? row.total ?? 0,
        moneda: row.moneda ?? "CLP",
        fecha: row.fecha,
        estado: row.estado ?? "Sin estado",
        codigoLicitacion: row.codigo_licitacion ?? null,
        descripcion: row.descripcion ?? null,
        totalNeto: row.total_neto ?? null,
        impuestos: row.impuestos ?? null,
        total: row.total ?? null,
        nombreUnidad: row.nombre_unidad ?? null,
        actividadComprador: row.actividad_comprador ?? null,
        direccionUnidad: row.direccion_unidad ?? null,
        comunaUnidad: row.comuna_unidad ?? null,
        regionUnidad: row.region_unidad ?? null,
        actividadProveedor: row.actividad_proveedor ?? null,
        direccionProveedor: row.direccion_proveedor ?? null,
        comunaProveedor: row.comuna_proveedor ?? null,
        regionProveedor: row.region_proveedor ?? null,
        cantidadItems: row.cantidad_items ?? null,
        items: row.items ?? [],
        payload: row.payload ?? null,
        _raw: row.payload ?? null,
    };
}

export function compraAgilUiADb(fila) {
    return {
        codigo: fila.codigo,
        nombre: fila.nombre ?? null,
        estado: fila.estado ?? null,
        organismo: fila.organismo ?? null,
        region: normalizarRegion(fila.region, { fallback: null }),
        monto: fila.monto ?? 0,
        moneda: fila.moneda ?? "CLP",
        fecha_cierre: aFechaIso(fila.fechaCierre),
        fecha_creacion: aFechaIso(fila.fechaCreacion),
        fecha_cancelacion: aFechaIso(fila.fechaCancelacion),
        estado_convocatoria: fila.estadoConvocatoria ?? null,
        fecha_cierre_primer_llamado: aFechaIso(fila.fechaCierrePrimerLlamado),
        fecha_cierre_segundo_llamado: aFechaIso(fila.fechaCierreSegundoLlamado),
        direccion_entrega: fila.direccionEntrega ?? null,
        plazo_entrega_dias: fila.plazoEntregaDias ?? null,
        total_ofertas_recibidas: fila.totalOfertasRecibidas ?? null,
        descripcion: fila.descripcion ?? null,
        productos: fila.productos ?? [],
        payload: fila._raw ?? null,
        sincronizado_en: new Date().toISOString(),
    };
}

export function compraAgilDbAUi(row) {
    return {
        id: row.codigo,
        codigo: row.codigo,
        nombre: row.nombre ?? "Sin nombre",
        estado: row.estado ?? "Sin estado",
        organismo: row.organismo ?? "Sin organismo",
        region: normalizarRegion(row.region),
        monto: row.monto ?? 0,
        moneda: row.moneda ?? "CLP",
        fechaCierre: row.fecha_cierre,
        fechaCreacion: row.fecha_creacion,
        fechaCancelacion: row.fecha_cancelacion,
        estadoConvocatoria: row.estado_convocatoria ?? null,
        fechaCierrePrimerLlamado: row.fecha_cierre_primer_llamado,
        fechaCierreSegundoLlamado: row.fecha_cierre_segundo_llamado,
        direccionEntrega: row.direccion_entrega ?? null,
        plazoEntregaDias: row.plazo_entrega_dias ?? null,
        totalOfertasRecibidas: row.total_ofertas_recibidas ?? null,
        descripcion: row.descripcion ?? null,
        productos: row.productos ?? [],
        payload: row.payload ?? null,
        _raw: row.payload ?? null,
    };
}
