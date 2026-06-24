import { fetchCompraAgil } from "@/services/mercado-publico/fetchCompraAgil";
import { mapCompraAgil } from "@/services/mercado-publico/mercadoPublicoMapper";
import {
    upsertFilasMercadoPublico,
    listarFilasMercadoPublico,
} from "@/services/supabase/mercadoPublicoRepo";

const TAMANO_PAGINA_API = 50;

function obtenerRangoPublicacion(diasAtras = 7) {
    const hasta = new Date();
    const desde = new Date();
    desde.setDate(hasta.getDate() - diasAtras);
    desde.setUTCHours(0, 0, 0, 0);
    hasta.setUTCHours(23, 59, 59, 0);

    const formatear = (fecha) =>
        fecha.toISOString().replace(/\.\d{3}Z$/, "Z");

    return {
        publicado_desde: formatear(desde),
        publicado_hasta: formatear(hasta),
    };
}

function extraerListaCompraAgil(respuestaApi) {
    const candidatos = [
        respuestaApi?.payload?.items,
        respuestaApi?.payload?.compras_agiles,
        respuestaApi?.payload?.registros,
        respuestaApi?.payload,
        respuestaApi?.data,
        respuestaApi?.items,
    ];

    for (const candidato of candidatos) {
        if (Array.isArray(candidato)) return candidato;
    }

    return [];
}

export async function getComprasAgiles({
    estado = "",
    region = "",
    textoBusqueda = "",
    diasAtras = 7,
} = {}) {
    const rango = obtenerRangoPublicacion(diasAtras);
    const fechaUsada = rango.publicado_hasta;

    try {
        const respuestaApi = await fetchCompraAgil("/v2/compra-agil", {
            parametros: {
                ...rango,
                estado,
                region,
                q: textoBusqueda,
                numero_pagina: 1,
                tamano_pagina: TAMANO_PAGINA_API,
                ordenar_por: "FechaPublicacion",
            },
        });

        const lista = extraerListaCompraAgil(respuestaApi);
        const filas = lista.map(mapCompraAgil).filter((f) => f?.codigo);

        const paginacion =
            respuestaApi?.payload?.paginacion ??
            respuestaApi?.paginacion ??
            null;

        const totalRegistros =
            paginacion?.total_registros ??
            paginacion?.total ??
            filas.length;

        if (filas.length > 0) {
            try {
                await upsertFilasMercadoPublico("compra-agil", filas);
            } catch (upsertError) {
                console.warn(
                    "[compra-agil] No se pudo guardar en Supabase:",
                    upsertError.message
                );
            }
        }

        return {
            filas,
            todasLasFilas: filas,
            totalRegistros,
            fechaUsada,
            desdeDb: false,
            fuente: "api2-compra-agil",
        };
    } catch (error) {
        console.warn("[compra-agil] API falló, leyendo Supabase:", error.message);

        const { filas, totalRegistros } = await listarFilasMercadoPublico(
            "compra-agil",
            { limite: 50000 }
        );

        return {
            filas,
            todasLasFilas: filas,
            totalRegistros,
            fechaUsada,
            desdeDb: filas.length > 0,
            fuente: "supabase",
            error: filas.length === 0 ? error.message : null,
        };
    }
}

export async function listarComprasAgiles(opciones = {}) {
    return getComprasAgiles(opciones);
}