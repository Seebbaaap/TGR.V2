import { listarFilasMercadoPublico } from "@/services/supabase/mercadoPublicoRepo";

export async function getComprasAgiles({ limite = 50000 } = {}) {
    const { filas, totalRegistros } = await listarFilasMercadoPublico(
        "compra-agil",
        { limite }
    );

    return {
        filas,
        totalRegistros,
    };
}
