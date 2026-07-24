import { listarFilasMercadoPublico } from "@/services/supabase/mercadoPublicoRepo";

function parseListadoParams(raw = {}) {
    const page = Math.max(1, parseInt(raw.page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(raw.pageSize, 10) || 5));

    return {
        q: String(raw.q ?? "").trim(),
        estado: String(raw.estado ?? "").trim(),
        region: String(raw.region ?? "").trim(),
        orden: String(raw.orden ?? "").trim(),
        page,
        pageSize,
        incluirFacetas: raw.facetas === "1" || raw.facetas === "true" || raw.facetas === true,
    };
}

export async function getListadoMercadoPublico(modulo, rawParams = {}) {
    return listarFilasMercadoPublico(modulo, parseListadoParams(rawParams));
}

export async function getLicitaciones(rawParams = {}) {
    return getListadoMercadoPublico("licitaciones", rawParams);
}

export async function getComprasAgiles(rawParams = {}) {
    return getListadoMercadoPublico("compra-agil", rawParams);
}

export async function getOrdenesCompra(rawParams = {}) {
    return getListadoMercadoPublico("ordenes-compra", rawParams);
}
