import { NextResponse } from "next/server";
import { getLicitaciones } from "@/services/mercado-publico/listadoMercadoPublicoService";

export async function GET() {
    try {
        const resultado = await getLicitaciones();
        return NextResponse.json(resultado);
    } catch (error) {
        return NextResponse.json(
            { error: error.message || "Error consultando licitaciones" },
            { status: 500 }
        );
    }
}
