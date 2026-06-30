import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
    licitacionUiADb,
    licitacionDbAUi,
    ordenCompraUiADb,
    ordenCompraDbAUi,
    compraAgilUiADb,
    compraAgilDbAUi,
} from "@/services/supabase/mercadoPublicoDbMapper";

const TABLAS = {
    licitaciones: {
        tabla: "licitaciones",
        uiADb: licitacionUiADb,
        dbAUi: licitacionDbAUi,
        orden: { columna: "fecha_cierre", ascendente: false },
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
    },
};

function getConfig(modulo) {
    const config = TABLAS[modulo];
    if (!config) throw new Error(`Módulo Supabase no soportado: ${modulo}`);
    return config;
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

export async function listarFilasMercadoPublico(modulo, { limite = 50000 } = {}) {
    const { tabla, dbAUi, orden } = getConfig(modulo);
    const supabase = getSupabaseAdmin();

    const { data, error, count } = await supabase
        .from(tabla)
        .select("*", { count: "exact" })
        .order(orden.columna, { ascending: orden.ascendente })
        .limit(limite);

    if (error) throw error;

    return {
        filas: (data ?? []).map(dbAUi),
        totalRegistros: count ?? data?.length ?? 0,
    };

}

export async function obtenerFilaPorCodigo(modulo, codigo) {
    const { tabla, dbAUi } = getConfig(modulo);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from(tabla)
        .select("*")
        .eq("codigo", codigo)
        .maybeSingle();
    if (error) throw error;
    return data ? dbAUi(data) : null;
}