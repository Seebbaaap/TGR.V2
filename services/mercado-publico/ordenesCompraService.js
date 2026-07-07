import { listarOrdenesCompra } from "@/services/supabase/mercadoPublicoRepo";

export async function getOrdenesCompra() {
    return listarOrdenesCompra();
}
