export function ordenarFilasMp(filas, orden, campoMonto, campoFecha = "fechaCierre") {
    if (!orden) return filas;

    const lista = [...filas];
    const desc = orden.endsWith("-desc");
    const mult = desc ? -1 : 1;
    const porPrecio = orden.startsWith("precio");

    lista.sort((a, b) => {
        if (porPrecio) {
            // Sin monto = menor (Number.NEGATIVE_INFINITY): al final en desc, al inicio en asc.
            const toMonto = (v) => {
                if (v == null || v === "") return Number.NEGATIVE_INFINITY;
                const n = Number(v);
                return Number.isNaN(n) ? Number.NEGATIVE_INFINITY : n;
            };
            return (toMonto(a[campoMonto]) - toMonto(b[campoMonto])) * mult;
        }

        const fa = a[campoFecha] ? new Date(a[campoFecha]).getTime() : 0;
        const fb = b[campoFecha] ? new Date(b[campoFecha]).getTime() : 0;
        return (fa - fb) * mult;
    });

    return lista;
}
