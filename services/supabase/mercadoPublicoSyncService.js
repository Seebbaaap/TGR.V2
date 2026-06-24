import { getLicitaciones } from "@/services/mercado-publico/licitacionesService";
import { getOrdenesCompra } from "@/services/mercado-publico/ordenesCompraService";
import { getComprasAgiles } from "@/services/mercado-publico/compraAgilService";

async function sincronizarModulo(modulo, obtenerFilas) {
    const resultado = await obtenerFilas();
    const todasLasFilas = resultado.todasLasFilas ?? resultado.filas ?? [];

    return {
        modulo,
        insertadas: todasLasFilas.length,
        total: todasLasFilas.length,
        desdeDb: resultado.desdeDb ?? false,
    };
}

export async function syncMercadoPublico() {
    const resultados = [];

    resultados.push(
        await sincronizarModulo("licitaciones", () =>
            getLicitaciones({ tamanoPagina: 500 })
        )
    );

    resultados.push(
        await sincronizarModulo("ordenes-compra", () =>
            getOrdenesCompra({ tamanoPagina: 500 })
        )
    );

    resultados.push(
        await sincronizarModulo("compra-agil", () =>
            getComprasAgiles({ tamanoPagina: 50 })
        )
    );

    return { sincronizados: resultados };
}