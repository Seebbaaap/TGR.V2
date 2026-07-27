import comunasChile from "@/data/comunas-chile.json";

function normalizarTexto(texto = "") {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function buscarPorTexto(texto = "") {
    const t = normalizarTexto(texto);
    if (!t) return null;

    if (comunasChile[t]) {
        return comunasChile[t];
    }

    for (const [nombre, coords] of Object.entries(comunasChile)) {
        if (t.includes(nombre) || nombre.includes(t)) {
            return coords;
        }
    }

    return null;
}

export function obtenerCoordsFicha({ analisis, comuna, direccion }) {
    const latReal = Number(analisis?.coordenadas?.lat);
    const lngReal = Number(analisis?.coordenadas?.lon ?? analisis?.coordenadas?.lng);

    if (Number.isFinite(latReal) && Number.isFinite(lngReal)) {
        return {
            lat: latReal,
            lng: lngReal,
            origen: "coordenadas",
        };
    }

    const porComuna = buscarPorTexto(comuna);
    if (porComuna) {
        return {
            ...porComuna,
            origen: "comuna",
        };
    }

    const porDireccion = buscarPorTexto(direccion);
    if (porDireccion) {
        return {
            ...porDireccion,
            origen: "direccion",
        };
    }

    return null;
}