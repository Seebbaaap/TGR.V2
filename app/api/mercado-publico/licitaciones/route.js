import { NextResponse } from "next/server";
import { getLicitaciones } from "@/services/mercado-publico/licitacionesService";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const resultado = await getLicitaciones({
            estado: searchParams.get("estado") || "",
            textoBusqueda: searchParams.get("q") || "",
        });

        return NextResponse.json(resultado);
    } catch (error) {
        return NextResponse.json(
            { error: error.message || "Error consultando licitaciones" },
            { status: 500 }
        );
    }
}