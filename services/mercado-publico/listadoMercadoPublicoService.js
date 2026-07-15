import {
    listarFilasMercadoPublico,
    listarOrdenesCompra,
} from "@/services/supabase/mercadoPublicoRepo";

export async function getLicitaciones({ limite = 50000 } = {}) {
    return listarFilasMercadoPublico("licitaciones", { limite });
}

export async function getComprasAgiles({ limite = 50000 } = {}) {
    return listarFilasMercadoPublico("compra-agil", { limite });
}

export async function getOrdenesCompra() {
    return listarOrdenesCompra();
}
