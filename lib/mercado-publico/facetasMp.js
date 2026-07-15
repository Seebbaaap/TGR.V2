/**
 * Catálogos de filtros para no escanear toda la tabla (esp. OC).
 * Se fusionan en el hook con valores vistos en la página actual.
 */
export const ESTADOS_FACETA = {
    licitaciones: [
        "Publicada",
        "Adjudicada",
        "Cerrada",
        "Desierta",
        "Cancelada",
        "Suspendida",
        "En Evaluación",
        "Revocada",
        "Sin estado",
    ],
    "ordenes-compra": [
        "Enviada a Proveedor",
        "Enviada",
        "En proceso",
        "Aceptada",
        "Cancelada",
        "Recepción Conforme",
        "Pendiente de Recepcionar",
        "Recepcionada Parcialmente",
        "Recepción Conforme Incompleta",
        "Recepcionada",
        "Sin estado",
    ],
    "compra-agil": [
        "Publicada",
        "Adjudicada",
        "Cerrada",
        "Desierta",
        "Cancelada",
        "Suspendida",
        "Sin estado",
    ],
};

/** Regiones típicas; se fusionan con las que vengan de la página / faceta liviana. */
export const REGIONES_FACETA = [
    "Arica y Parinacota",
    "Tarapacá",
    "Antofagasta",
    "Atacama",
    "Coquimbo",
    "Valparaíso",
    "Metropolitana de Santiago",
    "Libertador General Bernardo O'Higgins",
    "Maule",
    "Ñuble",
    "Biobío",
    "La Araucanía",
    "Los Ríos",
    "Los Lagos",
    "Aysén del General Carlos Ibáñez del Campo",
    "Magallanes y de la Antártica Chilena",
    "Sin región",
];

export function fusionarFacetas(catalogo = [], extra = []) {
    return [...new Set([...catalogo, ...extra].filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, "es")
    );
}
