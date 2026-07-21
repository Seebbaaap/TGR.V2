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
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = rutaInternaSegura(searchParams.get("next"));

    const supabase = await createSupabaseServerClient();

    let error = null;
    if (code) {
        ({ error } = await supabase.auth.exchangeCodeForSession(code));
    } else if (tokenHash && type) {
        ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
    } else {
        return NextResponse.redirect(`${origin}/login?error=enlace_invalido`);
    }

    if (error) {
        return NextResponse.redirect(`${origin}/login?error=enlace_invalido`);
    }

    // Para confirmación de cuenta registramos el usuario en la tabla "usuarios".
    if (type !== "recovery") {
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
                    proveedor: user.app_metadata?.provider || "email",
                    ultimo_acceso: new Date().toISOString(),
                },
                { onConflict: "id" }
            );
        }
    }

    return NextResponse.redirect(`${origin}${next}`);
}
