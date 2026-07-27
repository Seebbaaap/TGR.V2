import { NextResponse } from "next/server";
import { obtenerCoordsExactas } from "@/services/tgr/geocodingService";

export async function POST(req) {
    try {
        const body = await req.json();
        const { rol, direccion, comuna } = body;

        if (!rol) {
            return NextResponse.json({ error: "rol requerido" }, { status: 400 });
        }

        const coords = await obtenerCoordsExactas({ rol, direccion, comuna });

        return NextResponse.json({ coords: coords || null });
    } catch (error) {
        return NextResponse.json(
            { error: error.message || "Error inesperado" },
            { status: 500 }
        );
    }
}


