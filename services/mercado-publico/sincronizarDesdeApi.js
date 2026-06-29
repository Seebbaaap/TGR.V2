import { fetchMercadoPublico } from "@/services/mercado-publico/mercadoPublicoClient";
import { fetchCompraAgil } from "@/services/mercado-publico/fetchCompraAgil";
import { mapLicitacion, mapOrdenCompra, mapCompraAgil } from "@/services/mercado-publico/mercadoPublicoMapper";
import { extraerListado } from "@/lib/mercado-publico/extraerListado";
import { upsertFilasMercadoPublico } from "@/services/supabase/mercadoPublicoRepo";

function getFechaHoy() {
    const hoy = new Date();
    const dd = String(hoy.getDate()).padStart(2, "0");
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const yyyy = hoy.getFullYear();
    return `${dd}${mm}${yyyy}`;
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

export async function sincronizarLicitacionesDesdeApi({
    estado = "",
    textoBusqueda = "",
} = {}) {
    const fechaConsulta = getFechaHoy();

    const json = await fetchMercadoPublico("/licitaciones.json", {
        fecha: fechaConsulta,
        estado,
        ...(textoBusqueda ? { codigo: textoBusqueda } : {}),
    });

    const lista = extraerListado(json);
    const filas = lista.map(mapLicitacion).filter((f) => f?.codigo);

    const { insertadas } = await upsertFilasMercadoPublico("licitaciones", filas);

    return {
        modulo: "licitaciones",
        insertadas,
        total: filas.length,
        fechaUsada: fechaConsulta,
    };
}

export async function sincronizarOrdenesCompraDesdeApi({ codigo = "" } = {}) {
    const fechaConsulta = getFechaHoy();

    const json = await fetchMercadoPublico("/ordenesdecompra.json", {
        ...(codigo ? { codigo } : { fecha: fechaConsulta }),
    });

    const lista = extraerListado(json, [
        "ListadoOC",
        "ListadoOrdenesCompra",
        "Listado",
    ]);

    const filas = lista.map(mapOrdenCompra).filter((f) => f?.codigo);
    const { insertadas } = await upsertFilasMercadoPublico("ordenes-compra", filas);

    return {
        modulo: "ordenes-compra",
        insertadas,
        total: filas.length,
        fechaUsada: fechaConsulta,
    };
}

export async function sincronizarComprasAgilesDesdeApi({
    estado = "",
    region = "",
    textoBusqueda = "",
    diasAtras = 7,
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

    return {
        modulo: "compra-agil",
        insertadas,
        total: filas.length,
        fechaUsada,
    };
}