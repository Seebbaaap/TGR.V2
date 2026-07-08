"use client";

export default function AvisoDesdeDb({
    visible = true,
    loading = false,
    hayFilas = false,
    error = null,
}) {
    if (!visible) return null;

    const esError = Boolean(error);

    let contenido = null;

    if (esError) {
        contenido = `Error de conexión con Supabase: ${error}`;
    } else if (loading) {
        contenido = (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                    aria-hidden
                    style={{
                        width: "0.85rem",
                        height: "0.85rem",
                        border: "2px solid rgba(56,189,248,0.35)",
                        borderTopColor: "#38bdf8",
                        borderRadius: "50%",
                        animation: "mp-aviso-spin 0.75s linear infinite",
                        flexShrink: 0,
                    }}
                />
                Cargando datos desde la base de datos
            </span>
        );
    } else if (hayFilas) {
        contenido = "Actualización periódica ejecutada en segundo plano.";
    }

    if (!contenido) return null;

    return (
        <>
            <style>{`
                @keyframes mp-aviso-spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
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
                {contenido}
            </div>
        </>
    );
}
