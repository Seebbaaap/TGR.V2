import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Rutas públicas que no requieren iniciar sesión
const RUTAS_PUBLICAS = ["/login", "/auth"];

function esRutaPublica(pathname) {
    return RUTAS_PUBLICAS.some(
        (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`)
    );
}

export async function proxy(request) {
    const { response, user } = await updateSession(request);
    const { pathname } = request.nextUrl;

    // Sin sesión intentando entrar a una ruta protegida lo manda al login
    if (!user && !esRutaPublica(pathname)) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        if (pathname !== "/") {
            url.searchParams.set("next", pathname);
        }
        return NextResponse.redirect(url);
    }

    // Con sesión visitando el login manda directo al dashboard
    if (user && pathname === "/login") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard/tgr";
        url.search = "";
        return NextResponse.redirect(url);
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    ],
};
