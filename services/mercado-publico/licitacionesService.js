import { fetchMercadoPublico } from "@/services/mercado-publico/mercadoPublicoClient";
import { mapLicitacion } from "@/services/mercado-publico/mercadoPublicoMapper";
import { extraerListado } from "@/lib/mercado-publico/extraerListado";
import {
    upsertFilasMercadoPublico,
    listarFilasMercadoPublico,
} from "@/services/supabase/mercadoPublicoRepo";

function getFechaHoy() {
    const hoy = new Date();
    const dd = String(hoy.getDate()).padStart(2, "0");
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const yyyy = hoy.getFullYear();
    return `${dd}${mm}${yyyy}`;
}

function respuestaExito(todasLasFilas, fechaUsada, desdeDb) {
    return {
        filas: todasLasFilas,
        todasLasFilas,
        totalRegistros: todasLasFilas.length,
        fechaUsada,
        desdeDb,
    };
}

export async function getLicitaciones({
    estado = "",
    textoBusqueda = "",
} = {}) {
    const fechaConsulta = getFechaHoy();

    try {
        const json = await fetchMercadoPublico("/licitaciones.json", {
            fecha: fechaConsulta,
            estado,
            ...(textoBusqueda ? { codigo: textoBusqueda } : {}),
        });

        const lista = extraerListado(json);
        const todasLasFilas = lista
            .map(mapLicitacion)
            .filter((f) => f?.codigo);

        if (todasLasFilas.length > 0) {
            try {
                await upsertFilasMercadoPublico("licitaciones", todasLasFilas);
            } catch (upsertError) {
                console.warn(
                    "[licitaciones] No se pudo guardar en Supabase:",
                    upsertError.message
                );
            }
        }

        return respuestaExito(todasLasFilas, fechaConsulta, false);
    } catch (error) {
        console.warn("[licitaciones] API falló, leyendo Supabase:", error.message);

        const { filas, totalRegistros } = await listarFilasMercadoPublico(
            "licitaciones",
            { limite: 50000 }
        );

        return {
            filas,
            todasLasFilas: filas,
            totalRegistros,
            fechaUsada: fechaConsulta,
            desdeDb: filas.length > 0,
            error: filas.length === 0 ? error.message : null,
        };
    }
}