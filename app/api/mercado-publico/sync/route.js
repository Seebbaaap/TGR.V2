import { NextResponse } from "next/server";
import { syncMercadoPublico } from "@/services/supabase/mercadoPublicoSyncService";

export async function POST(request) {
    const { searchParams } = new URL(request.url);
    const usarStream = searchParams.get("stream") === "1";

    if (!usarStream) {
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

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
        async start(controller) {
            const enviar = (obj) => {
                controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));
            };

            try {
                const resultado = await syncMercadoPublico({
                    onProgreso: (detalle) => {
                        enviar({ type: "progress", ...detalle });
                    },
                });

                enviar({
                    type: "done",
                    success: !resultado.error,
                    ...resultado,
                });
            } catch (error) {
                enviar({ type: "done", success: false, error: error.message });
            }

            controller.close();
        },
    });

    return new Response(readable, {
        headers: {
            "Content-Type": "application/x-ndjson",
            "Cache-Control": "no-store",
        },
    });
}
