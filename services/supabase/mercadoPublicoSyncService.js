import {
    sincronizarLicitacionesDesdeApi,
    sincronizarOrdenesCompraDesdeApi,
    sincronizarComprasAgilesDesdeApi,
} from "@/services/mercado-publico/sincronizarDesdeApi";

async function sincronizarModuloSeguro(nombre, fn) {
    try {
        return await fn();
    } catch (error) {
        console.warn(`[sync] ${nombre} falló:`, error.message);
        return {
            modulo: nombre,
            insertadas: 0,
            total: 0,
            error: error.message,
        };
    }
}

export async function syncMercadoPublico() {
    const resultados = await Promise.all([
        sincronizarModuloSeguro("licitaciones", sincronizarLicitacionesDesdeApi),
        sincronizarModuloSeguro("ordenes-compra", sincronizarOrdenesCompraDesdeApi),
        sincronizarModuloSeguro("compra-agil", sincronizarComprasAgilesDesdeApi),
    ]);

    const huboError = resultados.some((r) => r.error);

    return {
        sincronizados: resultados,
        ...(huboError && {
            error: "Al menos un módulo no pudo sincronizarse",
        }),
    };
}