import { NextResponse } from "next/server";
import { getOrdenesCompra } from "@/services/mercado-publico/ordenesCompraService";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const resultado = await getOrdenesCompra({
            codigo: searchParams.get("codigo") || "",
        });

        return NextResponse.json(resultado);
    } catch (error) {
        return NextResponse.json(
            { error: error.message || "Error consultando órdenes de compra" },
            { status: 500 }
        );
    }
}