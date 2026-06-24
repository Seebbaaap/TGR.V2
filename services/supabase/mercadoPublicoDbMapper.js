function aFechaIso(valor) {
    if (!valor) return null;
    const d = new Date(valor);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function licitacionUiADb(fila) {
    return {
        codigo: fila.codigo,
        nombre: fila.nombre ?? null,
        estado: fila.estado ?? null,
        organismo: fila.organismo ?? null,
        fecha_cierre: aFechaIso(fila.fechaCierre),
        fecha_creacion: aFechaIso(fila.fechaCreacion),
        descripcion: fila.descripcion ?? null,
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
        fechaCierre: row.fecha_cierre,
        fechaCreacion: row.fecha_creacion,
        descripcion: row.descripcion ?? null,
    };
}

export function ordenCompraUiADb(fila) {
    return {
        codigo: fila.codigo,
        proveedor: fila.proveedor ?? null,
        comprador: fila.comprador ?? null,
        monto_total: fila.montoTotal ?? 0,
        moneda: fila.moneda ?? "CLP",
        fecha: aFechaIso(fila.fecha),
        estado: fila.estado ?? null,
        payload: fila._raw ?? null,
        sincronizado_en: new Date().toISOString(),
    };
}

export function ordenCompraDbAUi(row) {
    return {
        id: row.codigo,
        codigo: row.codigo,
        proveedor: row.proveedor ?? "Sin proveedor",
        comprador: row.comprador ?? "Sin organismo",
        montoTotal: row.monto_total ?? 0,
        moneda: row.moneda ?? "CLP",
        fecha: row.fecha,
        estado: row.estado ?? "Sin estado",
    };
}

export function compraAgilUiADb(fila) {
    return {
        codigo: fila.codigo,
        nombre: fila.nombre ?? null,
        estado: fila.estado ?? null,
        organismo: fila.organismo ?? null,
        region: fila.region ?? null,
        monto: fila.monto ?? 0,
        moneda: fila.moneda ?? "CLP",
        fecha_cierre: aFechaIso(fila.fechaCierre),
        fecha_creacion: aFechaIso(fila.fechaCreacion),
        descripcion: fila.descripcion ?? null,
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
        region: row.region ?? "Sin región",
        monto: row.monto ?? 0,
        moneda: row.moneda ?? "CLP",
        fechaCierre: row.fecha_cierre,
        fechaCreacion: row.fecha_creacion,
        descripcion: row.descripcion ?? null,
    };
}