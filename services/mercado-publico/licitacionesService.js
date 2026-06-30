import { listarFilasMercadoPublico } from "@/services/supabase/mercadoPublicoRepo";

export async function getLicitaciones({ limite = 50000 } = {}) {
    const { filas, totalRegistros } = await listarFilasMercadoPublico(
        "licitaciones",
        { limite }
    );

    return {
        filas,
        totalRegistros,
    };
}
