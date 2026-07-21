import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Solo permite rutas internas (evita redirecciones abiertas a sitios externos).
function rutaInternaSegura(next) {
    return next && next.startsWith("/") && !next.startsWith("//")
        ? next
        : "/dashboard/tgr";
}

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = rutaInternaSegura(searchParams.get("next"));

    if (!code) {
        return NextResponse.redirect(`${origin}/login?error=sin_codigo`);
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        return NextResponse.redirect(`${origin}/login?error=auth`);
    }

    // Registrar al usuario y marcar su último acceso.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        await supabase.from("usuarios").upsert(
            {
                id: user.id,
                email: user.email,
                nombre:
                    user.user_metadata?.full_name ||
                    user.user_metadata?.name ||
                    null,
                avatar_url: user.user_metadata?.avatar_url || null,
                proveedor: user.app_metadata?.provider || "google",
                ultimo_acceso: new Date().toISOString(),
            },
            { onConflict: "id" }
        );
    }

    return NextResponse.redirect(`${origin}${next}`);
}
