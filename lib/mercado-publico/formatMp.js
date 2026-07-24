/** Formatea CLP; 0 / vacío → "—" (listados y detalle MP). */
export function formatMoneyMp(value) {
    const amount = Number(value || 0);
    if (!amount) return "—";
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * @param {unknown} valor
 * @param {{ conHora?: boolean }} [opts]
 */
export function formatFechaMp(valor, { conHora = false } = {}) {
    if (!valor) return "—";
    const normalizado = String(valor).replace(" ", "T");
    const fecha = new Date(normalizado);
    if (isNaN(fecha.getTime())) return valor;

    const opts = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...(conHora ? { hour: "2-digit", minute: "2-digit" } : {}),
    };

    return fecha.toLocaleDateString("es-CL", opts);
}
