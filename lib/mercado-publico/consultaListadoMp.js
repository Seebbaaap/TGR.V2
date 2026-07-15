/** Mapea el selector de orden de la UI a columna DB + dirección. */
export function resolverOrdenMp(modulo, ordenUi, ordenDefault) {
    const porModulo = {
        licitaciones: { monto: "monto_estimado", fecha: "fecha_cierre" },
        "ordenes-compra": { monto: "monto_total", fecha: "fecha" },
        "compra-agil": { monto: "monto", fecha: "fecha_cierre" },
    };

    const campos = porModulo[modulo] ?? { monto: ordenDefault.columna, fecha: ordenDefault.columna };

    if (!ordenUi) {
        return { columna: ordenDefault.columna, ascendente: ordenDefault.ascendente };
    }

    const desc = ordenUi.endsWith("-desc");
    if (ordenUi.startsWith("precio")) {
        const ascendente = !desc;
        // Sin monto = “menor”: NULL primero en ASC, último en DESC (no el default de Postgres).
        return { columna: campos.monto, ascendente, nullsFirst: ascendente };
    }
    if (ordenUi.startsWith("fecha")) {
        return { columna: campos.fecha, ascendente: !desc };
    }

    return { columna: ordenDefault.columna, ascendente: ordenDefault.ascendente };
}

/** Campos de búsqueda texto por módulo (nombres de columna DB). */
export function columnasBusquedaMp(modulo) {
    if (modulo === "ordenes-compra") return ["codigo", "proveedor", "comprador"];
    if (modulo === "compra-agil") return ["codigo", "nombre", "organismo"];
    return ["codigo", "nombre"];
}

export function sanitizarBusquedaMp(valor) {
    return String(valor ?? "")
        .trim()
        .replace(/[%_,.()"'\\]/g, " ")
        .replace(/\s+/g, " ")
        .slice(0, 80);
}
