"use client";

export default function AvisoDesdeDb({
    visible = true,
    sincronizando = false,
    hayFilas = false,
    error = null,
}) {
    if (!visible) return null;

    const esError = !sincronizando && error;

    return (
        <div
            style={{
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                border: esError ? "1px solid var(--warning)" : "1px solid #38bdf8",
                background: esError
                    ? "color-mix(in srgb, var(--warning) 10%, transparent)"
                    : "rgba(56,189,248,0.1)",
                color: esError ? "var(--warning)" : "#38bdf8",
                fontSize: "0.82rem",
            }}
        >
            {sincronizando
                ? "Sincronizando con Mercado Público y actualizando Supabase..."
                : esError
                  ? `Error de conexión con Supabase: ${error}`
                  : hayFilas
                    ? "Datos servidos desde Supabase (sincronizados al abrir la aplicación)."
                    : "Sin registros en Supabase. Si acabas de abrir la app, espera a que termine la sincronización."}
        </div>
    );
}