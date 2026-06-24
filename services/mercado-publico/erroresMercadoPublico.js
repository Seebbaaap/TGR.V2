export function lanzarErrorMercadoPublico(statusHttp, urlConsultada) {
    const mensajesPorCodigo = {
        400: "Solicitud inválida (400)",
        401: "Ticket no autorizado (401)",
        403: "Acceso prohibido (403)",
        404: "Recurso no encontrado (404)",
        429: "Cuota diaria del ticket agotada (429)",
        500: "Error interno de Mercado Público (500)",
        503: "Servicio no disponible (503)",
    };

    const mensajeBase =
        mensajesPorCodigo[statusHttp] ?? `Error HTTP ${statusHttp}`;

    throw new Error(`${mensajeBase} al consultar ${urlConsultada}`);
}