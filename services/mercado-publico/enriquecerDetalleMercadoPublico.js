import { tieneDetalleEnPayload } from "@/services/mercado-publico/mercadoPublicoMapper";
import { obtenerDetalleMercadoPublico } from "@/services/mercado-publico/obtenerDetalleMercadoPublico";
import {
    listarPendientesDetalle,
    marcarOrdenCompraDetalleNoDisponible,
    obtenerFilaPorCodigo,
} from "@/services/supabase/mercadoPublicoRepo";

const MODULOS = ["licitaciones", "compra-agil", "ordenes-compra"];

function esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/** OC: detalle útil = ya tiene fecha. Resto de módulos: payload enriquecido. */
function tieneDetalleUtil(modulo, fila) {
    if (modulo === "ordenes-compra") {
        return Boolean(fila?.fecha);
    }
    return tieneDetalleEnPayload(modulo, fila?.payload);
}

export async function enriquecerDetalleMercadoPublico({
    limite = 3,
    pausaMs = 10000,
    modulos = MODULOS,
} = {}) {
    const listaModulos = (Array.isArray(modulos) && modulos.length > 0
        ? modulos
        : MODULOS
    ).filter((m) => MODULOS.includes(m));

    if (listaModulos.length === 0) {
        throw new Error(`Módulos inválidos. Use: ${MODULOS.join(", ")}`);
    }

    const procesados = [];
    const cupoPorModulo = Math.max(1, Math.ceil(limite / listaModulos.length));

    for (const modulo of listaModulos) {
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
                const teniaDetalle = tieneDetalleUtil(modulo, antes);

                const { fila } = await obtenerDetalleMercadoPublico(modulo, codigo);
                const tieneAhora = tieneDetalleUtil(modulo, fila);

                let detalle = "sin_cambio";
                if (teniaDetalle) detalle = "ya_tenia";
                else if (tieneAhora) detalle = "actualizado";

                // OC sin fecha tras el fetch: marcar para no bloquear la cola
                if (modulo === "ordenes-compra" && !tieneAhora) {
                    await marcarOrdenCompraDetalleNoDisponible(codigo);
                    detalle = "no_disponible";
                }

                procesados.push({
                    modulo,
                    codigo,
                    listado: antes ? "en_bd" : "nuevo",
                    detalle,
                    ok: true,
                });
            } catch (error) {
                if (modulo === "ordenes-compra") {
                    try {
                        await marcarOrdenCompraDetalleNoDisponible(codigo);
                    } catch {
                        // no enmascarar el error original
                    }
                }

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
