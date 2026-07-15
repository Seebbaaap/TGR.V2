import { fetchMercadoPublico } from "@/services/mercado-publico/mercadoPublicoClient";
import { fetchCompraAgil } from "@/services/mercado-publico/fetchCompraAgil";
import { mapLicitacion, mapOrdenCompra, mapCompraAgil, tieneDetalleEnPayload } from "@/services/mercado-publico/mercadoPublicoMapper";
import { extraerListado } from "@/lib/mercado-publico/extraerListado";
import {
    obtenerFilaPorCodigo,
    upsertFilasMercadoPublico,
} from "@/services/supabase/mercadoPublicoRepo";

const MAP_FN = {
    licitaciones: mapLicitacion,
    "ordenes-compra": mapOrdenCompra,
    "compra-agil": mapCompraAgil,
};

async function fetchDetalleDesdeApi(modulo, codigo) {
    if (modulo === "licitaciones") {
        const json = await fetchMercadoPublico("/licitaciones.json", { codigo });
        return extraerListado(json)[0] ?? null;
    }
    if (modulo === "ordenes-compra") {
        const json = await fetchMercadoPublico("/ordenesdecompra.json", { codigo });
        return extraerListado(json, ["ListadoOC", "ListadoOrdenesCompra", "Listado"])[0] ?? null;
    }
    if (modulo === "compra-agil") {
        const json = await fetchCompraAgil(`/v2/compra-agil/${encodeURIComponent(codigo)}`);
        return json?.payload ?? null;
    }
    return null;
}

export async function obtenerDetalleMercadoPublico(modulo, codigo) {
    const mapFn = MAP_FN[modulo];
    if (!mapFn) throw new Error(`Módulo no soportado: ${modulo}`);

    const existente = await obtenerFilaPorCodigo(modulo, codigo);

    // OC: si ya tiene fecha, el detalle ya fue persistido
    if (modulo === "ordenes-compra" && existente?.fecha) {
        return { fila: existente };
    }

    if (existente && tieneDetalleEnPayload(modulo, existente.payload)) {
        return { fila: existente };
    }

    const crudo = await fetchDetalleDesdeApi(modulo, codigo);
    if (!crudo) {
        return { fila: existente };
    }

    const filaMapeada = mapFn(crudo);
    await upsertFilasMercadoPublico(modulo, [filaMapeada]);

    const actualizada = await obtenerFilaPorCodigo(modulo, codigo);
    return { fila: actualizada ?? filaMapeada };
}