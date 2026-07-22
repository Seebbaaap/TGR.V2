import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { mapearListaRemates, deduplicarRemates } from "@/services/tgr/rematesMapper";

const TGR_URL = "https://remates.tgr.cl/v1/getListaRematesActivos";

const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "es-CL,es;q=0.9",
    Referer: "https://remates.tgr.cl/",
    Origin: "https://remates.tgr.cl",
};

let _cache = null;
let _cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 60 * 1000;

function extraerArray(json) {
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json?.remates)) return json.remates;
    if (Array.isArray(json?.resultado)) return json.resultado;
    if (Array.isArray(json?.items)) return json.items;
    if (Array.isArray(json?.lista)) return json.lista;
    if (Array.isArray(json?.registros)) return json.registros;
    return [];
}

function valorNumero(...vals) {
    for (const v of vals) {
        if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;

        if (typeof v === "string" && v.trim() !== "") {
            const limpio = v
                .replace(/\$/g, "")
                .replace(/\s/g, "")
                .replace(/\./g, "")
                .replace(/,/g, ".")
                .replace(/[^\d.-]/g, "");

            const n = Number(limpio);
            if (!Number.isNaN(n) && n > 0) return n;
        }
    }
    return null;
}

function valorTexto(...vals) {
    for (const v of vals) {
        if (v !== null && v !== undefined && `${v}`.trim() !== "") return `${v}`.trim();
    }
    return null;
}

function deepGet(obj, path) {
    try {
        return path.split(".").reduce((acc, key) => acc?.[key], obj);
    } catch {
        return undefined;
    }
}

function buscarNumeroEnObjeto(obj, claves) {
    if (!obj || typeof obj !== "object") return null;

    for (const clave of claves) {
        const directo = obj[clave];
        const n1 = valorNumero(directo);
        if (n1) return n1;
    }

    for (const clave of claves) {
        const anidado = deepGet(obj, clave);
        const n2 = valorNumero(anidado);
        if (n2) return n2;
    }

    return null;
}

function buscarTextoEnObjeto(obj, claves) {
    if (!obj || typeof obj !== "object") return null;

    for (const clave of claves) {
        const directo = obj[clave];
        const t1 = valorTexto(directo);
        if (t1) return t1;
    }

    for (const clave of claves) {
        const anidado = deepGet(obj, clave);
        const t2 = valorTexto(anidado);
        if (t2) return t2;
    }

    return null;
}

function completarCamposCriticos(remate) {
    const raw = remate?._raw ?? {};

    const montoMinimo = buscarNumeroEnObjeto(remate, [
        "montoMinimo",
        "tasacionMinima",
        "posturaMinima",
        "valorMinimo",
        "minimoSubasta",
        "precioMinimo",
        "baseRemate",
        "base_minima",
        "postura_minima",
        "minimo_remate",
        "monto_minimo",
        "tasacion_minima",
        "valor_minimo",
        "base",
        "minimo",
        "subastaMinima",
        "detalle.montoMinimo",
        "detalle.tasacionMinima",
        "detalle.posturaMinima",
        "remate.montoMinimo",
        "remate.tasacionMinima",
        "remate.posturaMinima",
        "data.montoMinimo",
        "data.tasacionMinima",
        "data.posturaMinima",
    ]) || buscarNumeroEnObjeto(raw, [
        "montoMinimo",
        "tasacionMinima",
        "posturaMinima",
        "valorMinimo",
        "minimoSubasta",
        "precioMinimo",
        "baseRemate",
        "base_minima",
        "postura_minima",
        "minimo_remate",
        "monto_minimo",
        "tasacion_minima",
        "valor_minimo",
        "base",
        "minimo",
        "subastaMinima",
        "detalle.montoMinimo",
        "detalle.tasacionMinima",
        "detalle.posturaMinima",
        "remate.montoMinimo",
        "remate.tasacionMinima",
        "remate.posturaMinima",
        "data.montoMinimo",
        "data.tasacionMinima",
        "data.posturaMinima",
    ]);

    const rolCausa = buscarTextoEnObjeto(remate, [
        "rolCausa",
        "rolJuicio",
        "rolJudicial",
        "rol_judicial",
        "numeroCausa",
        "causa",
        "rit",
        "rolExpediente",
        "expedienteCausa",
        "detalle.rolCausa",
        "remate.rolCausa",
        "data.rolCausa",
    ]) || buscarTextoEnObjeto(raw, [
        "rolCausa",
        "rolJuicio",
        "rolJudicial",
        "rol_judicial",
        "numeroCausa",
        "causa",
        "rit",
        "rolExpediente",
        "expedienteCausa",
        "detalle.rolCausa",
        "remate.rolCausa",
        "data.rolCausa",
    ]);

    const periodoDesde = buscarTextoEnObjeto(remate, [
        "periodoDesde",
        "desdePeriodo",
        "periodoInicial",
        "inicioPeriodo",
        "periodo_inicio",
        "periodoDeudaDesde",
        "periodoMin",
        "desde",
        "detalle.periodoDesde",
        "data.periodoDesde",
    ]) || buscarTextoEnObjeto(raw, [
        "periodoDesde",
        "desdePeriodo",
        "periodoInicial",
        "inicioPeriodo",
        "periodo_inicio",
        "periodoDeudaDesde",
        "periodoMin",
        "desde",
        "detalle.periodoDesde",
        "data.periodoDesde",
    ]);

    const periodoHasta = buscarTextoEnObjeto(remate, [
        "periodoHasta",
        "hastaPeriodo",
        "periodoFinal",
        "finPeriodo",
        "periodo_fin",
        "periodoDeudaHasta",
        "periodoMax",
        "hasta",
        "detalle.periodoHasta",
        "data.periodoHasta",
    ]) || buscarTextoEnObjeto(raw, [
        "periodoHasta",
        "hastaPeriodo",
        "periodoFinal",
        "finPeriodo",
        "periodo_fin",
        "periodoDeudaHasta",
        "periodoMax",
        "hasta",
        "detalle.periodoHasta",
        "data.periodoHasta",
    ]);

    return {
        ...remate,
        montoMinimo: montoMinimo || remate.montoMinimo || null,
        rolCausa: rolCausa || remate.rolCausa || null,
        periodoDesde: periodoDesde || remate.periodoDesde || null,
        periodoHasta: periodoHasta || remate.periodoHasta || null,
    };
}

export async function getRematesActivos({ forzarRecarga = false } = {}) {
    const ahora = Date.now();
    const cacheValida = _cache && ahora - _cacheTimestamp < CACHE_TTL_MS;

    if (cacheValida && !forzarRecarga) {
        return _cache;
    }

    try {
        const respuesta = await fetchWithRetry(TGR_URL, {
            method: "GET",
            headers: HEADERS,
            cache: "no-store",
        });

        if (!respuesta.ok) {
            throw new Error(`TGR respondió con status ${respuesta.status}`);
        }

        const json = await respuesta.json();
        const arrayRaw = extraerArray(json);

        if (!arrayRaw.length) {
            return [];
        }

        const mapeados = mapearListaRemates(arrayRaw);
        const completados = mapeados.map(completarCamposCriticos);
        const deduplicados = deduplicarRemates(completados);

        _cache = deduplicados;
        _cacheTimestamp = ahora;

        return deduplicados;
    } catch (error) {
        if (_cache) return _cache;
        throw error;
    }
}

export function invalidarCache() {
    _cache = null;
    _cacheTimestamp = 0;
}

function tiempoRestanteCache() {
    if (!_cache) return 0;
    const transcurrido = Date.now() - _cacheTimestamp;
    const restante = CACHE_TTL_MS - transcurrido;
    return restante > 0 ? Math.ceil(restante / 60000) : 0;
}

export function estadoCache() {
    return {
        activa: !!_cache,
        registros: _cache?.length ?? 0,
        minutosRestantes: tiempoRestanteCache(),
    };
}