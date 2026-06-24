"use client";

function formatearFecha(fecha) {
    if (!fecha) return "";
    if (/^\d{8}$/.test(fecha)) {
        return `${fecha.slice(0, 2)}-${fecha.slice(2, 4)}-${fecha.slice(4)}`;
    }
    const d = new Date(fecha);
    if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString("es-CL");
    }
    return fecha;
}

export default function AvisoDesdeDb({
    visible = false,
    hayFilas = false,
    fecha = "",
    modulo = "registros",
}) {
    if (!visible || !hayFilas) return null;

    const fechaLegible = formatearFecha(fecha);

    return (
        <div
            style={{
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                border: "1px solid #fbbf24",
                background: "rgba(251,191,36,0.1)",
                color: "#fbbf24",
                fontSize: "0.82rem",
            }}
        >
            Mostrando {modulo} guardados en Supabase
            {fechaLegible ? ` (última consulta: ${fechaLegible})` : ""}.
            La API de Mercado Público no respondió en esta visita.
        </div>
    );
}