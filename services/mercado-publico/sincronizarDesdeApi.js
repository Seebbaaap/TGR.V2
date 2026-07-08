import { fetchMercadoPublico } from "@/services/mercado-publico/mercadoPublicoClient";
import { fetchCompraAgil } from "@/services/mercado-publico/fetchCompraAgil";
import { mapLicitacion, mapOrdenCompra, mapCompraAgil } from "@/services/mercado-publico/mercadoPublicoMapper";
import { extraerListado } from "@/lib/mercado-publico/extraerListado";
import {
    DIAS_RETENCION,
    upsertFilasMercadoPublico,
    borrarRegistrosAntiguos,
} from "@/services/supabase/mercadoPublicoRepo";

const ZONA_CHILE = "America/Santiago";

function partesFechaChile(fecha = new Date()) {
    const partes = new Intl.DateTimeFormat("en-GB", {
        timeZone: ZONA_CHILE,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).formatToParts(fecha);

    const get = (tipo) => partes.find((p) => p.type === tipo)?.value ?? "";

    return {
        dd: get("day"),
        mm: get("month"),
        yyyy: get("year"),
    };
}

/** Fecha de hoy en Chile (DDMMAAAA) para API v1 licitaciones / OC */
function getFechaHoy() {
    const { dd, mm, yyyy } = partesFechaChile();
    return `${dd}${mm}${yyyy}`;
}

function licitacionSigueVigente(fila) {
    if (!fila?.fechaCierre) return false;
    return new Date(fila.fechaCierre) >= new Date();
}

function obtenerRangoPublicacion(diasAtras = 7) {
    const hoy = partesFechaChile();
    const publicado_hasta = `${hoy.yyyy}-${hoy.mm}-${hoy.dd}T23:59:59Z`;

    const desdeMs = Date.now() - diasAtras * 24 * 60 * 60 * 1000;
    const desde = partesFechaChile(new Date(desdeMs));
    const publicado_desde = `${desde.yyyy}-${desde.mm}-${desde.dd}T00:00:00Z`;

    return { publicado_desde, publicado_hasta };
}

function extraerListaCompraAgil(respuestaApi) {
    const candidatos = [
        respuestaApi?.payload?.items,
        respuestaApi?.payload?.compras_agiles,
        respuestaApi?.payload?.registros,
        respuestaApi?.data,
        respuestaApi?.items,
    ];
    for (const candidato of candidatos) {
        if (Array.isArray(candidato)) return candidato;
    }
    return [];
}

const TAMANO_PAGINA_COMPRA_AGIL = 50;
// cron cada 5 min: pocas páginas por run para no superar timeout de Vercel
const MAX_PAGINAS_COMPRA_AGIL = 10;
const PAUSA_ENTRE_PAGINAS_MS = 500;

function esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function compraDentroDeRetencion(fila, diasAtras) {
    if (!fila?.fechaCreacion) return true;
    const desdeMs = Date.now() - diasAtras * 24 * 60 * 60 * 1000;
    const { yyyy, mm, dd } = partesFechaChile(new Date(desdeMs));
    const limite = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
    const creacion = new Date(fila.fechaCreacion);
    if (Number.isNaN(creacion.getTime())) return true;
    return creacion >= limite;
}

async function fetchCompraAgilConReintento(ruta, opciones, intentos = 3) {
    let ultimoError;

    for (let i = 0; i < intentos; i += 1) {
        try {
            return await fetchCompraAgil(ruta, opciones);
        } catch (error) {
            ultimoError = error;
            if (i < intentos - 1) {
                await esperar(1500 * (i + 1));
            }
        }
    }

    throw ultimoError;
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
    onProgreso,
} = {}) {
    const rango = obtenerRangoPublicacion(diasAtras);
    const fechaUsada = rango.publicado_hasta;

    const codigosVistos = new Set();
    let paginasConsultadas = 0;
    let totalGuardado = 0;
    let avisoParcial = null;

    // guardamos cada pagina en supabase al vuelo  si falla en la 120 no perdemos las anteriores
    for (let numeroPagina = 1; numeroPagina <= MAX_PAGINAS_COMPRA_AGIL; numeroPagina += 1) {
        onProgreso?.({
            pagina: numeroPagina,
            acumulado: codigosVistos.size,
            fase: "consultando",
        });

        try {
            const respuestaApi = await fetchCompraAgilConReintento("/v2/compra-agil", {
                parametros: {
                    ...rango,
                    estado,
                    region,
                    q: textoBusqueda,
                    numero_pagina: numeroPagina,
                    tamano_pagina: TAMANO_PAGINA_COMPRA_AGIL,
                    ordenar_por: "FechaPublicacion",
                },
            });

            paginasConsultadas += 1;

            const lista = extraerListaCompraAgil(respuestaApi);
            if (lista.length === 0) break;

            const unicosAntes = codigosVistos.size;
            const filasPagina = [];

            for (const item of lista) {
                const fila = mapCompraAgil(item);
                if (!fila?.codigo) continue;
                if (!compraDentroDeRetencion(fila, diasAtras)) continue;
                if (codigosVistos.has(fila.codigo)) continue;

                codigosVistos.add(fila.codigo);
                filasPagina.push(fila);
            }

            if (filasPagina.length > 0) {
                onProgreso?.({
                    pagina: numeroPagina,
                    acumulado: codigosVistos.size,
                    fase: "guardando",
                });

                const { insertadas } = await upsertFilasMercadoPublico("compra-agil", filasPagina);
                totalGuardado += insertadas;
            }

            onProgreso?.({
                pagina: numeroPagina,
                acumulado: codigosVistos.size,
                fase: "pagina_lista",
            });

            const sinNuevos = codigosVistos.size === unicosAntes && lista.length > 0;
            const ultimaPorTamano = lista.length < TAMANO_PAGINA_COMPRA_AGIL;

            if (ultimaPorTamano || sinNuevos) break;

            if (numeroPagina < MAX_PAGINAS_COMPRA_AGIL) {
                await esperar(PAUSA_ENTRE_PAGINAS_MS);
            }
        } catch (error) {
            avisoParcial = error.message;
            console.warn(`[sync] compra-agil página ${numeroPagina}:`, error.message);
            break;
        }
    }

    const { eliminadas } = await borrarRegistrosAntiguos("compra-agil");

    return {
        modulo: "compra-agil",
        insertadas: totalGuardado,
        eliminadas,
        total: codigosVistos.size,
        paginasConsultadas,
        fechaUsada,
        ...(avisoParcial && {
            parcial: true,
            aviso: `Sync parcial (pág. ${paginasConsultadas}): ${avisoParcial}`,
            ...(totalGuardado === 0 ? { error: avisoParcial } : {}),
        }),
    };
}
