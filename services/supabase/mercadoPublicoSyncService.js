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

export async function syncMercadoPublico({ onProgreso } = {}) {
    const avisar = (mensaje, extra = {}) => onProgreso?.({ mensaje, ...extra });

    const resultados = [];

    avisar("Consultando licitaciones de hoy...", { modulo: "licitaciones" });
    resultados.push(
        await sincronizarModuloSeguro("licitaciones", sincronizarLicitacionesDesdeApi)
    );
    const lic = resultados[0];
    if (lic.error) {
        avisar(`Licitaciones: error — ${lic.error}`, { modulo: "licitaciones" });
    } else {
        avisar(
            `Licitaciones actualizadas (${lic.total ?? 0} registros, ${lic.eliminadas ?? 0} vencidas purgadas)`,
            { modulo: "licitaciones" }
        );
    }

    avisar("Consultando órdenes de compra de hoy...", { modulo: "ordenes-compra" });
    resultados.push(
        await sincronizarModuloSeguro("ordenes-compra", sincronizarOrdenesCompraDesdeApi)
    );
    const oc = resultados[1];
    if (oc.error) {
        avisar(`Órdenes de compra: error — ${oc.error}`, { modulo: "ordenes-compra" });
    } else {
        avisar(`Órdenes de compra actualizadas (${oc.total ?? 0} registros)`, {
            modulo: "ordenes-compra",
        });
    }

    avisar("Compra ágil: iniciando consulta paginada (últimos 7 días)...", {
        modulo: "compra-agil",
    });
    resultados.push(
        await sincronizarModuloSeguro("compra-agil", () =>
            sincronizarComprasAgilesDesdeApi({
                onProgreso: (detalle) => {
                    avisar(mensajeCompraAgil(detalle), {
                        modulo: "compra-agil",
                        ...detalle,
                    });
                },
            })
        )
    );
    const ca = resultados[2];
    if (ca.parcial && ca.aviso) {
        avisar(`Compra ágil: ${ca.aviso}`, { modulo: "compra-agil" });
    } else if (ca.error) {
        avisar(`Compra ágil: error — ${ca.error}`, { modulo: "compra-agil" });
    } else {
        avisar(
            `Compra ágil lista (${ca.total ?? 0} registros, ${ca.paginasConsultadas ?? 1} páginas)`,
            { modulo: "compra-agil" }
        );
    }

    const huboError = resultados.some(esErrorFatal);

    return {
        sincronizados: resultados,
        ...(huboError && {
            error: "Al menos un módulo no pudo sincronizarse",
        }),
    };
}
