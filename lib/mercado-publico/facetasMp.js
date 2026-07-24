/**
 * Catálogos de filtros para no escanear toda la tabla (esp. OC).
 * Se fusionan en el hook con valores vistos en la página actual.
 */
export const ESTADOS_FACETA = {
    licitaciones: [
        "Publicada",
        "Revocada",
    ],
    "ordenes-compra": [
        "Enviada a Proveedor",
        "En proceso",
        "Aceptada",
        "Cancelada",
        "Recepción Conforme",
        "Pendiente de Recepcionar",
        "Recepción Conforme Incompleta",
        "Recepcionada",
    ],
    "compra-agil": [
        "Publicada",
        "Cerrada",
        "Desierta",
        "Cancelada",
        "Suspendida",
    ],
};

/** Regiones típicas; se fusionan con las que vengan de la página / faceta liviana. */
export const REGIONES_FACETA = [

];

export function fusionarFacetas(catalogo = [], extra = []) {
    return [...new Set([...catalogo, ...extra].filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, "es")
    );
}
