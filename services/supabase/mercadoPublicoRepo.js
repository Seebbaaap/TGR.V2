import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { tieneDetalleCompraAgil, tieneDetalleEnPayload } from "@/services/mercado-publico/mercadoPublicoMapper";
import {
    licitacionUiADb,
    licitacionDbAUi,
    ordenCompraUiADb,
    ordenCompraDbAUi,
    COLUMNAS_LISTADO_ORDEN_COMPRA,
    COLUMNAS_LISTADO_LICITACION,
    COLUMNAS_LISTADO_COMPRA_AGIL,
    compraAgilUiADb,
    compraAgilDbAUi,
} from "@/services/supabase/mercadoPublicoDbMapper";
import {
    columnasBusquedaMp,
    resolverOrdenMp,
    sanitizarBusquedaMp,
} from "@/lib/mercado-publico/consultaListadoMp";
import { ESTADOS_FACETA, REGIONES_FACETA, fusionarFacetas } from "@/lib/mercado-publico/facetasMp";

const DIAS_RETENCION = 7;
const PAGE_SIZE_DEFAULT = 5;
const PAGE_SIZE_MAX = 50;

const TABLAS = {
    licitaciones: {
        tabla: "licitaciones",
        uiADb: licitacionUiADb,
        dbAUi: licitacionDbAUi,
        columnasListado: COLUMNAS_LISTADO_LICITACION,
        orden: { columna: "fecha_cierre", ascendente: false },
        soloVigentes: true,
    },
    "ordenes-compra": {
        tabla: "ordenes_compra",
        uiADb: ordenCompraUiADb,
        dbAUi: ordenCompraDbAUi,
        columnasListado: COLUMNAS_LISTADO_ORDEN_COMPRA,
        orden: { columna: "fecha", ascendente: false },
    },
    "compra-agil": {
        tabla: "compra_agil",
        uiADb: compraAgilUiADb,
        dbAUi: compraAgilDbAUi,
        columnasListado: COLUMNAS_LISTADO_COMPRA_AGIL,
        orden: { columna: "fecha_cierre", ascendente: false },
        diasRetencion: DIAS_RETENCION,
        columnaRetencion: "fecha_creacion",
    },
};

export { DIAS_RETENCION };

function getConfig(modulo) {
    const config = TABLAS[modulo];
    if (!config) throw new Error(`Módulo Supabase no soportado: ${modulo}`);
    return config;
}

function limiteDesde(dias) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);
    fecha.setHours(0, 0, 0, 0);
    return fecha.toISOString();
}

function ahoraIso() {
    return new Date().toISOString();
}


function deduplicarPorCodigo(filasUi = []) {
    const mapa = new Map();

    for (const fila of filasUi) {
        const codigo = String(fila?.codigo ?? "").trim();
        if (!codigo) continue;
        mapa.set(codigo, fila);
    }

    return Array.from(mapa.values());
}

function tieneProductosUi(productos) {
    return Array.isArray(productos) && productos.length > 0;
}

// si ya abrieron "ver mas", el listado del sync no deberia borrar ese detalle
function mergeCompraAgilConExistente(nueva, existente) {
    if (!existente) return nueva;

    const detalleGuardado = tieneDetalleCompraAgil(existente.payload ?? existente._raw);

    return {
        ...nueva,
        descripcion: nueva.descripcion ?? existente.descripcion ?? null,
        productos: tieneProductosUi(nueva.productos)
            ? nueva.productos
            : (existente.productos ?? []),
        direccionEntrega: nueva.direccionEntrega ?? existente.direccionEntrega ?? null,
        plazoEntregaDias: nueva.plazoEntregaDias ?? existente.plazoEntregaDias ?? null,
        totalOfertasRecibidas:
            nueva.totalOfertasRecibidas ?? existente.totalOfertasRecibidas ?? null,
        estadoConvocatoria: nueva.estadoConvocatoria ?? existente.estadoConvocatoria ?? null,
        fechaCierrePrimerLlamado:
            nueva.fechaCierrePrimerLlamado ?? existente.fechaCierrePrimerLlamado ?? null,
        fechaCierreSegundoLlamado:
            nueva.fechaCierreSegundoLlamado ?? existente.fechaCierreSegundoLlamado ?? null,
        _raw: detalleGuardado ? (existente.payload ?? existente._raw) : nueva._raw,
    };
}

async function obtenerFilasExistentesPorCodigo(modulo, codigos = []) {
    if (codigos.length === 0) return new Map();

    const { tabla, dbAUi } = getConfig(modulo);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from(tabla)
        .select("*")
        .in("codigo", codigos);

    if (error) throw error;

    const mapa = new Map();
    for (const row of data ?? []) {
        mapa.set(row.codigo, dbAUi(row));
    }

    return mapa;
}

export async function upsertFilasMercadoPublico(modulo, filasUi = []) {
    const { tabla, uiADb } = getConfig(modulo);
    const unicas = deduplicarPorCodigo(filasUi);

    if (unicas.length === 0) return { insertadas: 0 };

    let filasFinales = unicas;

    if (modulo === "compra-agil") {
        const codigos = unicas.map((f) => f.codigo);
        const existentes = await obtenerFilasExistentesPorCodigo(modulo, codigos);
        filasFinales = unicas.map((fila) =>
            mergeCompraAgilConExistente(fila, existentes.get(fila.codigo))
        );
    }

    const rows = filasFinales.map(uiADb);
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
        .from(tabla)
        .upsert(rows, { onConflict: "codigo" });

    if (error) throw error;

    return { insertadas: rows.length };
}

export async function borrarRegistrosAntiguos(modulo) {
    const config = getConfig(modulo);
    const supabase = getSupabaseAdmin();

    if (config.soloVigentes) {
        const { count, error } = await supabase
            .from(config.tabla)
            .delete({ count: "exact" })
            .lt("fecha_cierre", ahoraIso());

        if (error) throw error;
        return { eliminadas: count ?? 0 };
    }

    const { diasRetencion, columnaRetencion, tabla } = config;
    if (!diasRetencion) return { eliminadas: 0 };

    const { count, error } = await supabase
        .from(tabla)
        .delete({ count: "exact" })
        .lt(columnaRetencion, limiteDesde(diasRetencion));

    if (error) throw error;
    return { eliminadas: count ?? 0 };
}

function aplicarFiltrosBase(consulta, config) {
    if (config.soloVigentes) {
        return consulta.gte("fecha_cierre", ahoraIso());
    }
    if (config.diasRetencion) {
        return consulta.gte(config.columnaRetencion, limiteDesde(config.diasRetencion));
    }
    return consulta;
}

function aplicarFiltrosUsuario(consulta, modulo, { q, estado, region }) {
    let c = consulta;
    const busqueda = sanitizarBusquedaMp(q);

    if (busqueda) {
        const cols = columnasBusquedaMp(modulo);
        const orExpr = cols.map((col) => `${col}.ilike.%${busqueda}%`).join(",");
        c = c.or(orExpr);
    }

    if (estado) {
        c = c.eq("estado", estado);
    }

    if (region && modulo === "compra-agil") {
        c = c.eq("region", region);
    }

    return c;
}

/**
 * Listado paginado + filtros en BD.
 * Mantiene total del módulo (solo filtros base) y total filtrado (base + usuario).
 */
export async function listarFilasMercadoPublico(
    modulo,
    {
        q = "",
        estado = "",
        region = "",
        orden = "",
        page = 1,
        pageSize = PAGE_SIZE_DEFAULT,
        incluirFacetas = false,
    } = {}
) {
    const config = getConfig(modulo);
    const { tabla, dbAUi, columnasListado } = config;
    const supabase = getSupabaseAdmin();

    const size = Math.min(
        PAGE_SIZE_MAX,
        Math.max(1, Number(pageSize) || PAGE_SIZE_DEFAULT)
    );
    const pagina = Math.max(1, Number(page) || 1);
    const from = (pagina - 1) * size;
    const to = from + size - 1;

    const ordenResuelto = resolverOrdenMp(modulo, orden, config.orden);
    const filtrosUsuario = { q, estado, region };
    const hayFiltroUsuario = Boolean(sanitizarBusquedaMp(q) || estado || (region && modulo === "compra-agil"));

    // Total del módulo (solo retención/vigencia)
    const countModuloPromise = aplicarFiltrosBase(
        supabase.from(tabla).select("codigo", { count: "exact", head: true }),
        config
    );

    // Página filtrada
    let consulta = aplicarFiltrosBase(
        supabase.from(tabla).select(columnasListado, { count: "exact" }),
        config
    );
    consulta = aplicarFiltrosUsuario(consulta, modulo, filtrosUsuario);
    consulta = consulta
        .order(ordenResuelto.columna, {
            ascending: ordenResuelto.ascendente,
        })
        .range(from, to);

    const facetasPromise = incluirFacetas
        ? listarFacetasLivianas(supabase, modulo, config)
        : Promise.resolve(null);

    const [countModuloRes, dataRes, facetas] = await Promise.all([
        countModuloPromise,
        consulta,
        facetasPromise,
    ]);

    if (countModuloRes.error) throw countModuloRes.error;
    if (dataRes.error) throw dataRes.error;

    const filas = (dataRes.data ?? []).map(dbAUi);
    const totalFiltrados = dataRes.count ?? filas.length;
    const totalRegistros = countModuloRes.count ?? (hayFiltroUsuario ? totalFiltrados : filas.length);

    const estadosEnPagina = filas.map((f) => f.estado).filter(Boolean);
    const regionesEnPagina = filas.map((f) => f.region).filter(Boolean);

    const estadosBase = facetas?.estados ?? ESTADOS_FACETA[modulo] ?? [];
    const regionesBase =
        modulo === "compra-agil" ? (facetas?.regiones ?? REGIONES_FACETA) : [];

    return {
        filas,
        totalRegistros,
        totalFiltrados,
        pagina,
        pageSize: size,
        estados: fusionarFacetas(estadosBase, estadosEnPagina),
        regiones:
            modulo === "compra-agil"
                ? fusionarFacetas(regionesBase, regionesEnPagina)
                : [],
    };
}

/** Facetas sin arrastrar payload: catálogo + sample liviano en CA/licitaciones. */
async function listarFacetasLivianas(supabase, modulo, config) {
    const catalogoEstados = ESTADOS_FACETA[modulo] ?? [];

    // OC: no escanear 140k filas
    if (modulo === "ordenes-compra") {
        return { estados: catalogoEstados, regiones: [] };
    }

    const cols = modulo === "compra-agil" ? "estado, region" : "estado";
    let q = aplicarFiltrosBase(
        supabase.from(config.tabla).select(cols),
        config
    );
    q = q.limit(8000);

    const { data, error } = await q;
    if (error) {
        return {
            estados: catalogoEstados,
            regiones: modulo === "compra-agil" ? REGIONES_FACETA : [],
        };
    }

    const estados = fusionarFacetas(
        catalogoEstados,
        (data ?? []).map((r) => r.estado)
    );
    const regiones =
        modulo === "compra-agil"
            ? fusionarFacetas(
                  REGIONES_FACETA,
                  (data ?? []).map((r) => r.region)
              )
            : [];

    return { estados, regiones };
}

/** @deprecated preferir listarFilasMercadoPublico con page/pageSize */
export async function listarOrdenesCompra(opts = {}) {
    return listarFilasMercadoPublico("ordenes-compra", opts);
}

export async function obtenerFilaPorCodigo(modulo, codigo) {
    const config = getConfig(modulo);
    const { tabla, dbAUi } = config;
    const supabase = getSupabaseAdmin();

    let consulta = supabase
        .from(tabla)
        .select("*")
        .eq("codigo", codigo);

    if (config.soloVigentes) {
        consulta = consulta.gte("fecha_cierre", ahoraIso());
    }

    const { data, error } = await consulta.maybeSingle();
    if (error) throw error;
    return data ? dbAUi(data) : null;
}

/**
 * OC: sin fecha = pendiente de detalle.
 * Tras un intento fallido se marca payload._detalleNoDisponible para no rebloquear la cola.
 */
export async function marcarOrdenCompraDetalleNoDisponible(codigo) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from("ordenes_compra")
        .select("payload")
        .eq("codigo", codigo)
        .maybeSingle();

    if (error) throw error;
    if (!data) return;

    const payloadActual =
        data.payload && typeof data.payload === "object" ? data.payload : {};

    const { error: errorUpdate } = await supabase
        .from("ordenes_compra")
        .update({
            payload: {
                ...payloadActual,
                _detalleNoDisponible: true,
            },
        })
        .eq("codigo", codigo);

    if (errorUpdate) throw errorUpdate;
}

// filas que aun no tienen payload de detalle (para el cron / script local)
export async function listarPendientesDetalle(modulo, limite = 10) {
    const config = getConfig(modulo);
    const { tabla, orden } = config;
    const supabase = getSupabaseAdmin();

    // Órdenes de compra: la fecha solo se setea con detalle → pendientes = fecha IS NULL
    if (modulo === "ordenes-compra") {
        const { data, error } = await supabase
            .from(tabla)
            .select("codigo, payload, fecha")
            .is("fecha", null)
            .order("sincronizado_en", { ascending: false })
            .limit(Math.max(limite * 20, 50));

        if (error) throw error;

        return (data ?? [])
            .filter((row) => row.payload?._detalleNoDisponible !== true)
            .slice(0, limite)
            .map((row) => ({ modulo, codigo: row.codigo }));
    }

    // Licitaciones: detalle = payload.Comprador (filtrar en DB, no solo top 150)
    if (modulo === "licitaciones") {
        const { data, error } = await supabase
            .from(tabla)
            .select("codigo, payload")
            .gte("fecha_cierre", ahoraIso())
            .is("payload->Comprador", null)
            .order("fecha_cierre", { ascending: true })
            .limit(limite);

        if (error) throw error;

        return (data ?? []).map((row) => ({ modulo, codigo: row.codigo }));
    }

    // Compra ágil / otros: recorrer páginas hasta juntar pendientes reales
    const pageSize = 100;
    const maxScan = 2000;
    const pendientes = [];

    for (let from = 0; from < maxScan && pendientes.length < limite; from += pageSize) {
        let consulta = supabase
            .from(tabla)
            .select("codigo, payload")
            .order(orden.columna, { ascending: orden.ascendente })
            .range(from, from + pageSize - 1);

        if (config.soloVigentes) {
            consulta = consulta.gte("fecha_cierre", ahoraIso());
        } else if (config.diasRetencion) {
            consulta = consulta.gte(config.columnaRetencion, limiteDesde(config.diasRetencion));
        }

        const { data, error } = await consulta;
        if (error) throw error;
        if (!data?.length) break;

        for (const row of data) {
            if (!tieneDetalleEnPayload(modulo, row.payload)) {
                pendientes.push({ modulo, codigo: row.codigo });
                if (pendientes.length >= limite) break;
            }
        }

        if (data.length < pageSize) break;
    }

    return pendientes;
}