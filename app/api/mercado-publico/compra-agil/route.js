import { NextResponse } from "next/server";
import { getComprasAgiles } from "@/services/mercado-publico/listadoMercadoPublicoService";

export async function GET(request) {
    try {
        const params = Object.fromEntries(request.nextUrl.searchParams.entries());
        const resultado = await getComprasAgiles(params);
        return NextResponse.json(resultado);
    } catch (error) {
        return NextResponse.json(
            { error: error.message || "Error consultando Compra Ágil" },
            { status: 500 }
        );
    }
}
