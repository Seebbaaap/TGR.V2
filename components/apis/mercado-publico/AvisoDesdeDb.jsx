"use client";

export default function AvisoDesdeDb({
    visible = true,
    sincronizando = false,
    hayFilas = false,
}) {
    if (!visible) return null;

    return (
        <div
            style={{
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                border: "1px solid #38bdf8",
                background: "rgba(56,189,248,0.1)",
                color: "#38bdf8",
                fontSize: "0.82rem",
            }}
        >
            {sincronizando
                ? "Sincronizando con Mercado Público y actualizando Supabase..."
                : hayFilas
                  ? "Datos servidos desde Supabase (sincronizados al abrir la aplicación)."
                  : "Sin registros en Supabase. Si acabas de abrir la app, espera a que termine la sincronización."}
        </div>
    );
}