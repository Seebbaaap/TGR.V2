import { NextResponse } from "next/server";
import { syncMercadoPublico } from "@/services/supabase/mercadoPublicoSyncService";

export async function POST() {
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