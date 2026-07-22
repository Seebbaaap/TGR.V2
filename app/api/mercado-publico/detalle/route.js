import { NextResponse } from "next/server";
import { obtenerDetalleMercadoPublico } from "@/services/mercado-publico/obtenerDetalleMercadoPublico";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const modulo = searchParams.get("modulo");
    const codigo = searchParams.get("codigo");

    if (!modulo || !codigo) {
        return NextResponse.json(
            { error: "Parámetros modulo y codigo requeridos" },
            { status: 400 }
        );
    }

    try {
        const { fila } = await obtenerDetalleMercadoPublico(modulo, codigo);
        if (!fila) {
            return NextResponse.json({ error: "No encontrado" }, { status: 404 });
        }
        return NextResponse.json({ fila });
    } catch (error) {
        return NextResponse.json(
            { error: error.message || "Error obteniendo detalle" },
            { status: error.message?.includes("429") ? 429 : 500 }
        );
    }
}
