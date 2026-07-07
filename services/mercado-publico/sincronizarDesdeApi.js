import { fetchMercadoPublico } from "@/services/mercado-publico/mercadoPublicoClient";
import { fetchCompraAgil } from "@/services/mercado-publico/fetchCompraAgil";
import { mapLicitacion, mapOrdenCompra, mapCompraAgil } from "@/services/mercado-publico/mercadoPublicoMapper";
import { extraerListado } from "@/lib/mercado-publico/extraerListado";
import {
    DIAS_RETENCION,
    upsertFilasMercadoPublico,
    borrarRegistrosAntiguos,
} from "@/services/supabase/mercadoPublicoRepo";

function formatearFechaConsulta(fecha) {
    const dd = String(fecha.getDate()).padStart(2, "0");
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    const yyyy = fecha.getFullYear();
    return `${dd}${mm}${yyyy}`;
}

function getFechaHoy() {
    return formatearFechaConsulta(new Date());
}

function licitacionSigueVigente(fila) {
    if (!fila?.fechaCierre) return false;
    return new Date(fila.fechaCierre) >= new Date();
}

function obtenerRangoPublicacion(diasAtras = 7) {
    const hasta = new Date();
    const desde = new Date();
    desde.setDate(hasta.getDate() - diasAtras);
    desde.setUTCHours(0, 0, 0, 0);
    hasta.setUTCHours(23, 59, 59, 0);
    const formatear = (fecha) => fecha.toISOString().replace(/\.\d{3}Z$/, "Z");
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

export async function sincronizarLicitacionesDesdeApi({ estado = "", textoBusqueda = "" } = {}) {
    const fechaConsulta = getFechaHoy();
    const json = await fetchMercadoPublico("/licitaciones.json", {
        fecha: fechaConsulta,
        estado,
        ...(textoBusqueda ? { codigo: textoBusqueda } : {}),
    });

    const filas = extraerListado(json)
        .map(mapLicitacion)
        .filter((f) => f?.codigo && licitacionSigueVigente(f));

    const { insertadas } = await upsertFilasMercadoPublico("licitaciones", filas);
    const { eliminadas } = await borrarRegistrosAntiguos("licitaciones");

    return {
        modulo: "licitaciones",
        insertadas,
        eliminadas,
        total: filas.length,
        fechaUsada: fechaConsulta,
    };
}

export async function sincronizarOrdenesCompraDesdeApi({ codigo = "" } = {}) {
    const fechaConsulta = getFechaHoy();
    const json = await fetchMercadoPublico("/ordenesdecompra.json", {
        ...(codigo ? { codigo } : { fecha: fechaConsulta }),
    });
    const lista = extraerListado(json, ["ListadoOC", "ListadoOrdenesCompra", "Listado"]);
    const filas = lista.map(mapOrdenCompra).filter((f) => f?.codigo);
    const { insertadas } = await upsertFilasMercadoPublico("ordenes-compra", filas);
    return { modulo: "ordenes-compra", insertadas, total: filas.length, fechaUsada: fechaConsulta };
}

export async function sincronizarComprasAgilesDesdeApi({
    estado = "",
    region = "",
    textoBusqueda = "",
    diasAtras = DIAS_RETENCION,
} = {}) {
    const rango = obtenerRangoPublicacion(diasAtras);
    const fechaUsada = rango.publicado_hasta;
    const respuestaApi = await fetchCompraAgil("/v2/compra-agil", {
        parametros: {
            ...rango,
            estado,
            region,
            q: textoBusqueda,
            numero_pagina: 1,
            tamano_pagina: 50,
            ordenar_por: "FechaPublicacion",
        },
    });
    const lista = extraerListaCompraAgil(respuestaApi);
    const filas = lista.map(mapCompraAgil).filter((f) => f?.codigo);
    const { insertadas } = await upsertFilasMercadoPublico("compra-agil", filas);
    const { eliminadas } = await borrarRegistrosAntiguos("compra-agil");

    return { modulo: "compra-agil", insertadas, eliminadas, total: filas.length, fechaUsada };
}