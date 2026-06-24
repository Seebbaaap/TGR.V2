import { NextResponse } from "next/server";
import { syncMercadoPublico } from "@/services/supabase/mercadoPublicoSyncService";

export async function GET(request) {
    const { searchParams } = new URL(request.url);

    const secret =
        request.headers.get("x-cron-secret") ??
        searchParams.get("secret");

    if (!secret || secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
        const resultado = await syncMercadoPublico();
        return NextResponse.json({ success: true, ...resultado });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}