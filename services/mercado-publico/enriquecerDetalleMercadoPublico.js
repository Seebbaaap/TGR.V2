import { tieneDetalleEnPayload } from "@/services/mercado-publico/mercadoPublicoMapper";
import { obtenerDetalleMercadoPublico } from "@/services/mercado-publico/obtenerDetalleMercadoPublico";
import {
    listarPendientesDetalle,
    obtenerFilaPorCodigo,
} from "@/services/supabase/mercadoPublicoRepo";

const MODULOS = ["licitaciones", "compra-agil", "ordenes-compra"];

function esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function enriquecerDetalleMercadoPublico({
    limite = 3,
    pausaMs = 10000,
} = {}) {
    const procesados = [];
    const cupoPorModulo = Math.max(1, Math.ceil(limite / MODULOS.length));

    for (const modulo of MODULOS) {
        if (procesados.length >= limite) break;

        const faltan = limite - procesados.length;
        const candidatos = await listarPendientesDetalle(
            modulo,
            Math.min(faltan, cupoPorModulo)
        );

        for (const { codigo } of candidatos) {
            if (procesados.length >= limite) break;

            if (procesados.length > 0 && pausaMs > 0) {
                await esperar(pausaMs);
            }

            try {
                const antes = await obtenerFilaPorCodigo(modulo, codigo);
                const teniaDetalle = tieneDetalleEnPayload(modulo, antes?.payload);

                const { fila } = await obtenerDetalleMercadoPublico(modulo, codigo);
                const tieneAhora = tieneDetalleEnPayload(modulo, fila?.payload);

                let detalle = "sin_cambio";
                if (teniaDetalle) detalle = "ya_tenia";
                else if (tieneAhora) detalle = "actualizado";

                procesados.push({
                    modulo,
                    codigo,
                    listado: antes ? "en_bd" : "nuevo",
                    detalle,
                    ok: true,
                });
            } catch (error) {
                procesados.push({
                    modulo,
                    codigo,
                    listado: "en_bd",
                    detalle: "error",
                    ok: false,
                    error: error.message,
                });
            }
        }
    }

    return {
        success: procesados.some((p) => p.ok) || procesados.length === 0,
        procesados,
        total: procesados.length,
    };
}
