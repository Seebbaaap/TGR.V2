import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
    licitacionUiADb,
    licitacionDbAUi,
    ordenCompraUiADb,
    ordenCompraDbAUi,
    COLUMNAS_LISTADO_ORDEN_COMPRA,
    compraAgilUiADb,
    compraAgilDbAUi,
} from "@/services/supabase/mercadoPublicoDbMapper";

const DIAS_RETENCION = 7;

const TABLAS = {
    licitaciones: {
        tabla: "licitaciones",
        uiADb: licitacionUiADb,
        dbAUi: licitacionDbAUi,
        orden: { columna: "fecha_cierre", ascendente: false },
        soloVigentes: true,
    },
    "ordenes-compra": {
        tabla: "ordenes_compra",
        uiADb: ordenCompraUiADb,
        dbAUi: ordenCompraDbAUi,
        orden: { columna: "fecha", ascendente: false },
    },
    "compra-agil": {
        tabla: "compra_agil",
        uiADb: compraAgilUiADb,
        dbAUi: compraAgilDbAUi,
        orden: { columna: "fecha_cierre", ascendente: false },
        diasRetencion: DIAS_RETENCION,
        columnaRetencion: "fecha_creacion",
    },
};

export { DIAS_RETENCION };

const TAMANO_LOTE_ORDENES = 5000;

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

export async function upsertFilasMercadoPublico(modulo, filasUi = []) {
    const { tabla, uiADb } = getConfig(modulo);
    const unicas = deduplicarPorCodigo(filasUi);

    if (unicas.length === 0) return { insertadas: 0 };

    const rows = unicas.map(uiADb);
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

export async function listarFilasMercadoPublico(modulo, { limite = 50000 } = {}) {
    const config = getConfig(modulo);
    const { tabla, dbAUi, orden } = config;
    const supabase = getSupabaseAdmin();

    let consulta = supabase
        .from(tabla)
        .select("*", { count: "exact" });

    if (config.soloVigentes) {
        consulta = consulta.gte("fecha_cierre", ahoraIso());
    } else if (config.diasRetencion) {
        consulta = consulta.gte(config.columnaRetencion, limiteDesde(config.diasRetencion));
    }

    const { data, error, count } = await consulta
        .order(orden.columna, { ascending: orden.ascendente })
        .limit(limite);

    if (error) throw error;

    return {
        filas: (data ?? []).map(dbAUi),
        totalRegistros: count ?? data?.length ?? 0,
    };

}

export async function listarOrdenesCompra() {
    const { tabla, dbAUi, orden } = getConfig("ordenes-compra");
    const supabase = getSupabaseAdmin();
    const filas = [];
    let desde = 0;

    while (true) {
        const { data, error } = await supabase
            .from(tabla)
            .select(COLUMNAS_LISTADO_ORDEN_COMPRA)
            .order(orden.columna, { ascending: orden.ascendente })
            .range(desde, desde + TAMANO_LOTE_ORDENES - 1);

        if (error) throw error;

        const lote = data ?? [];
        filas.push(...lote.map(dbAUi));

        if (lote.length < TAMANO_LOTE_ORDENES) break;
        desde += TAMANO_LOTE_ORDENES;
    }

    return {
        filas,
        totalRegistros: filas.length,
    };
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