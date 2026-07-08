import { NextResponse } from "next/server";
import {
    MODULOS_SYNC,
    syncMercadoPublico,
    syncMercadoPublicoModulo,
} from "@/services/supabase/mercadoPublicoSyncService";

export const maxDuration = 300;

export async function GET(request) {
    const { searchParams } = new URL(request.url);

    const secret =
        request.headers.get("x-cron-secret") ??
        searchParams.get("secret");

    if (!secret || secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const modulo = searchParams.get("modulo");

    if (modulo && !MODULOS_SYNC.includes(modulo)) {
        return NextResponse.json(
            {
                error: `Módulo inválido. Use: ${MODULOS_SYNC.join(", ")}`,
            },
            { status: 400 }
        );
    }

    try {
        if (modulo) {
            const resultado = await syncMercadoPublicoModulo(modulo);
            const huboError = Boolean(resultado.error && !resultado.parcial);
            return NextResponse.json({
                success: !huboError,
                modulo,
                sincronizados: [resultado],
                ...(huboError && { error: resultado.error }),
            });
        }

        const resultado = await syncMercadoPublico();
        return NextResponse.json({ success: true, ...resultado });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
