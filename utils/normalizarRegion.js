const FALLBACK = "Sin región";

export function normalizarRegion(texto, { fallback = FALLBACK } = {}) {
    if (texto == null || texto === "") return fallback;

    const limpio = String(texto)
        .replace(/\u00A0/g, " ")
        .normalize("NFC")
        .trim()
        .replace(/\s+/g, " ");

    return limpio || fallback;
}
