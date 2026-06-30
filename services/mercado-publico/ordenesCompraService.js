import { listarFilasMercadoPublico } from "@/services/supabase/mercadoPublicoRepo";

export async function getOrdenesCompra({ limite = 50000 } = {}) {
    const { filas, totalRegistros } = await listarFilasMercadoPublico(
        "ordenes-compra",
        { limite }
    );

    return {
        filas,
        totalRegistros,
    };
}
