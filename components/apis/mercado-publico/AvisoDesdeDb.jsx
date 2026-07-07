"use client";

export default function AvisoDesdeDb({
    visible = true,
    sincronizando = false,
    mensajeSync = null,
    hayFilas = false,
    error = null,
    errorSync = null,
}) {
    if (!visible) return null;

    const esErrorDb = !sincronizando && error;
    const esErrorSync = !sincronizando && errorSync;
    const esError = esErrorDb || esErrorSync;

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
                ? (mensajeSync ?? "Sincronizando con Mercado Público en segundo plano...")
                : esErrorSync
                  ? `Sync en segundo plano: ${errorSync}`
                  : esErrorDb
                    ? `Error de conexión con Supabase: ${error}`
                    : hayFilas
                      ? "Datos desde Supabase. La sincronización en segundo plano actualiza los registros."
                      : "Sin registros en Supabase todavía. El sync en segundo plano puede tardar un poco."}
        </div>
    );
}
