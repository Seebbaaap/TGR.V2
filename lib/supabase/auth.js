import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getUsuarioActual = cache(async () => {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { user: null, perfil: null };

    const { data: perfil } = await supabase
        .from("usuarios")
        .select("id, email, nombre, avatar_url, proveedor, rol, creado_en, ultimo_acceso")
        .eq("id", user.id)
        .maybeSingle();

    return { user, perfil };
});
