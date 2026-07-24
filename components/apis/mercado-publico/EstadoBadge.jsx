const BADGE_ESTILOS = {
    Publicada: { border: "#16a34a", bg: "rgba(22,163,74,0.12)", color: "#4ade80" },
    Adjudicada: { border: "#0284c7", bg: "rgba(2,132,199,0.12)", color: "#38bdf8" },
    Cerrada: { border: "#6b7280", bg: "rgba(107,114,128,0.12)", color: "#9ca3af" },
    Desierta: { border: "#d97706", bg: "rgba(217,119,6,0.12)", color: "#fbbf24" },
    Cancelada: { border: "#dc2626", bg: "rgba(220,38,38,0.12)", color: "#f87171" },
    Suspendida: { border: "#ea580c", bg: "rgba(234,88,12,0.12)", color: "#fb923c" },
    "En Evaluación": { border: "#7c3aed", bg: "rgba(124,58,237,0.12)", color: "#a78bfa" },
    Revocada: { border: "#dc2626", bg: "rgba(220,38,38,0.12)", color: "#f87171" },
    Aceptada: { border: "#16a34a", bg: "rgba(22,163,74,0.12)", color: "#4ade80" },
    Enviada: { border: "#0284c7", bg: "rgba(2,132,199,0.12)", color: "#38bdf8" },
    "Enviada a Proveedor": { border: "#0284c7", bg: "rgba(2,132,199,0.12)", color: "#38bdf8" },
    "En proceso": { border: "#0284c7", bg: "rgba(2,132,199,0.12)", color: "#38bdf8" },
    Recepcionada: { border: "#7c3aed", bg: "rgba(124,58,237,0.12)", color: "#a78bfa" },
    "Recepción Conforme": { border: "#7c3aed", bg: "rgba(124,58,237,0.12)", color: "#a78bfa" },
    "Pendiente de Recepcionar": { border: "#d97706", bg: "rgba(217,119,6,0.12)", color: "#fbbf24" },
    "Recepcionada Parcialmente": { border: "#ea580c", bg: "rgba(234,88,12,0.12)", color: "#fb923c" },
    "Recepción Conforme Incompleta": { border: "#ea580c", bg: "rgba(234,88,12,0.12)", color: "#fb923c" },
};

const FALLBACK = {
    border: "#6b7280",
    bg: "rgba(107,114,128,0.12)",
    color: "#9ca3af",
};

export default function EstadoBadge({ estado }) {
    const s = BADGE_ESTILOS[estado] || FALLBACK;

    return (
        <span
            style={{
                display: "inline-block",
                padding: "0.15rem 0.65rem",
                borderRadius: "9999px",
                border: `1px solid ${s.border}`,
                background: s.bg,
                color: s.color,
                fontSize: "0.72rem",
                fontWeight: 500,
            }}
        >
            {estado || "Sin estado"}
        </span>
    );
}
