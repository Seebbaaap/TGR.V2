import { NextResponse } from "next/server";
import { getOrdenesCompra } from "@/services/mercado-publico/ordenesCompraService";

export async function GET() {
    try {
        const resultado = await getOrdenesCompra();
        return NextResponse.json(resultado);
    } catch (error) {
        return NextResponse.json(
            { error: error.message || "Error consultando órdenes de compra" },
            { status: 500 }
        );
    }
}
