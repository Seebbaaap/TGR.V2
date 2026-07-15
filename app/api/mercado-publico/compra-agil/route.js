import { NextResponse } from "next/server";
import { getComprasAgiles } from "@/services/mercado-publico/listadoMercadoPublicoService";

export async function GET() {
    try {
        const resultado = await getComprasAgiles();
        return NextResponse.json(resultado);
    } catch (error) {
        return NextResponse.json(
            { error: error.message || "Error consultando Compra Ágil" },
            { status: 500 }
        );
    }
}
