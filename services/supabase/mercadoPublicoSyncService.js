import {
    sincronizarLicitacionesDesdeApi,
    sincronizarOrdenesCompraDesdeApi,
    sincronizarComprasAgilesDesdeApi,
} from "@/services/mercado-publico/sincronizarDesdeApi";

export const MODULOS_SYNC = ["licitaciones", "ordenes-compra", "compra-agil"];

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

function mensajeCompraAgil({ pagina, acumulado, fase }) {
    if (fase === "guardando") {
        return `Compra ágil: guardando página ${pagina} en Supabase (${acumulado} acumuladas)...`;
    }

    if (fase === "pagina_lista") {
        return `Compra ágil: página ${pagina} lista (${acumulado} acumuladas)`;
    }

    return `Compra ágil: consultando página ${pagina}...`;
}

function esErrorFatal(resultado) {
    if (!resultado?.error) return false;
    if (resultado.parcial && (resultado.total ?? 0) > 0) return false;
    return true;
}

export async function syncMercadoPublicoModulo(modulo, { onProgreso } = {}) {
    const avisar = (mensaje, extra = {}) => onProgreso?.({ mensaje, ...extra });

    if (modulo === "licitaciones") {
        avisar("Consultando licitaciones de hoy...", { modulo });
        const resultado = await sincronizarModuloSeguro(
            "licitaciones",
            sincronizarLicitacionesDesdeApi
        );
        if (resultado.error) {
            avisar(`Licitaciones: error — ${resultado.error}`, { modulo });
        } else {
            avisar(
                `Licitaciones actualizadas (${resultado.total ?? 0} registros, ${resultado.eliminadas ?? 0} vencidas purgadas)`,
                { modulo }
            );
        }
        return resultado;
    }

    if (modulo === "ordenes-compra") {
        avisar("Consultando órdenes de compra de hoy...", { modulo });
        const resultado = await sincronizarModuloSeguro(
            "ordenes-compra",
            sincronizarOrdenesCompraDesdeApi
        );
        if (resultado.error) {
            avisar(`Órdenes de compra: error — ${resultado.error}`, { modulo });
        } else {
            avisar(`Órdenes de compra actualizadas (${resultado.total ?? 0} registros)`, {
                modulo,
            });
        }
        return resultado;
    }

    if (modulo === "compra-agil") {
        avisar("Compra ágil: iniciando consulta paginada (últimos 7 días)...", { modulo });
        const resultado = await sincronizarModuloSeguro("compra-agil", () =>
            sincronizarComprasAgilesDesdeApi({
                onProgreso: (detalle) => {
                    avisar(mensajeCompraAgil(detalle), { modulo, ...detalle });
                },
            })
        );
        if (resultado.parcial && resultado.aviso) {
            avisar(`Compra ágil: ${resultado.aviso}`, { modulo });
        } else if (resultado.error) {
            avisar(`Compra ágil: error — ${resultado.error}`, { modulo });
        } else {
            avisar(
                `Compra ágil lista (${resultado.total ?? 0} registros, ${resultado.paginasConsultadas ?? 1} páginas)`,
                { modulo }
            );
        }
        return resultado;
    }

    throw new Error(
        `Módulo no soportado: ${modulo}. Use: ${MODULOS_SYNC.join(", ")}`
    );
}

export async function syncMercadoPublico({ onProgreso } = {}) {
    const resultados = [];

    for (const modulo of MODULOS_SYNC) {
        resultados.push(await syncMercadoPublicoModulo(modulo, { onProgreso }));
    }

    const huboError = resultados.some(esErrorFatal);

    return {
        sincronizados: resultados,
        ...(huboError && {
            error: "Al menos un módulo no pudo sincronizarse",
        }),
    };
}
