import { NextResponse } from "next/server";
import { getOrdenesCompra } from "@/services/mercado-publico/listadoMercadoPublicoService";

export async function GET(request) {
    try {
        const params = Object.fromEntries(request.nextUrl.searchParams.entries());
        const resultado = await getOrdenesCompra(params);
        return NextResponse.json(resultado);
    } catch (error) {
        return NextResponse.json(
            { error: error.message || "Error consultando órdenes de compra" },
            { status: 500 }
        );
    }
}
