export function ordenarFilasMp(filas, orden, campoMonto, campoFecha = "fechaCierre") {
    if (!orden) return filas;

    const lista = [...filas];
    const desc = orden.endsWith("-desc");
    const mult = desc ? -1 : 1;
    const porPrecio = orden.startsWith("precio");

    lista.sort((a, b) => {
        if (porPrecio) {
            const ma = Number(a[campoMonto] ?? 0);
            const mb = Number(b[campoMonto] ?? 0);
            return (ma - mb) * mult;
        }

        const fa = a[campoFecha] ? new Date(a[campoFecha]).getTime() : 0;
        const fb = b[campoFecha] ? new Date(b[campoFecha]).getTime() : 0;
        return (fa - fb) * mult;
    });

    return lista;
}
