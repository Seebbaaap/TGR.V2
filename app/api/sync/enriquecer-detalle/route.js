import { NextResponse } from "next/server";
import { enriquecerDetalleMercadoPublico } from "@/services/mercado-publico/enriquecerDetalleMercadoPublico";

function leerSecret(request) {
    const { searchParams } = new URL(request.url);
    return (
        request.headers.get("x-cron-secret") ??
        searchParams.get("secret")
    );
}

export async function POST(request) {
    const secret = leerSecret(request);

    if (!secret || secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limite = Math.min(Number(searchParams.get("limite")) || 3, 15);
    const pausaMs = Math.min(Number(searchParams.get("pausaMs")) || 10000, 30000);

    try {
        const resultado = await enriquecerDetalleMercadoPublico({ limite, pausaMs });
        return NextResponse.json({ success: true, ...resultado });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    return POST(request);
}
