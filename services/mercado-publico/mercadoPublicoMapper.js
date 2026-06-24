const ESTADOS_LICITACION = {
    5: "Publicada",
    6: "Cerrada",
    7: "Desierta",
    8: "Adjudicada",
    18: "Revocada",
    19: "Suspendida",
};

const ESTADOS_ORDEN_COMPRA = {
    4: "Enviada a Proveedor",
    5: "En proceso",
    6: "Aceptada",
    9: "Cancelada",
    12: "Recepción Conforme",
    13: "Pendiente de Recepcionar",
    14: "Recepcionada Parcialmente",
    15: "Recepción Conforme Incompleta",
};

function desempaquetarLicitacion(itemCrudo) {
    return itemCrudo?.Licitacion ?? itemCrudo?.licitacion ?? itemCrudo;
}

function desempaquetarOrdenCompra(itemCrudo) {
    return itemCrudo?.OrdenCompra ?? itemCrudo?.ordenCompra ?? itemCrudo;
}

function etiquetaEstado(codigo, mapa) {
    if (codigo == null || codigo === "") return "";
    const n = Number(codigo);
    return mapa[n] ?? mapa[String(codigo)] ?? `Estado ${codigo}`;
}

function resolverEstadoLicitacion(item) {
    const texto = item?.Estado ?? item?.estado ?? item?.EstadoLicitacion;
    if (texto) return texto;

    const codigo = item?.CodigoEstado ?? item?.codigoEstado;
    return etiquetaEstado(codigo, ESTADOS_LICITACION) || "Sin estado";
}

function resolverEstadoOrdenCompra(item) {
    const texto = item?.Estado ?? item?.estado;
    if (texto) return texto;

    const codigo = item?.CodigoEstado ?? item?.codigoEstado;
    return etiquetaEstado(codigo, ESTADOS_ORDEN_COMPRA) || "Sin estado";
}

export function mapCompraAgil(item = {}) {
    // API v2 (api2.mercadopublico.cl) — snake_case
    if (item.codigo && !item.CodigoExterno) {
        const estado = item.estado ?? {};
        const fechas = item.fechas ?? {};
        const montos = item.montos ?? {};
        const institucion = item.institucion ?? {};
        const organismo = institucion.organismo_comprador;

        return {
            id: item.codigo,
            codigo: item.codigo,
            nombre: item.nombre ?? "Sin nombre",
            estado: estado.glosa ?? estado.codigo ?? "Sin estado",
            fechaCreacion: fechas.fecha_publicacion ?? null,
            fechaCierre: fechas.fecha_cierre ?? null,
            organismo:
                typeof organismo === "string"
                    ? organismo
                    : organismo?.nombre ?? "Sin organismo",
            region:
                institucion.nombre_region ??
                institucion.region ??
                "Sin región",
            monto:
                montos.monto_disponible_clp ??
                montos.monto_disponible ??
                0,
            moneda: montos.moneda ?? "CLP",
            descripcion: item.descripcion ?? null,
            _raw: item,
        };
    }

    // API legacy (PascalCase)
    return {
        id: item.CodigoExterno ?? item.ID ?? null,
        codigo: item.CodigoExterno ?? null,
        nombre: item.Nombre ?? item.NombreProducto ?? "Sin nombre",
        estado: item.Estado ?? "Sin estado",
        fechaCreacion: item.FechaCreacion ?? null,
        fechaCierre: item.FechaCierre ?? null,
        organismo: item.NombreOrganismo ?? item.Organismo ?? "Sin organismo",
        region: item.Region ?? "Sin región",
        monto: item.MontoEstimado ?? item.Monto ?? 0,
        moneda: item.Moneda ?? "CLP",
        descripcion: item.Descripcion ?? null,
        _raw: item,
    };
}

export function mapLicitacion(itemCrudo = {}) {
    const item = desempaquetarLicitacion(itemCrudo);
    const comprador = item?.Comprador ?? item?.comprador ?? {};
    const fechas = item?.Fechas ?? {};

    return {
        id: item.CodigoExterno ?? item.codigo ?? null,
        codigo: item.CodigoExterno ?? item.codigo ?? null,
        nombre: item.Nombre ?? item.nombre ?? "Sin nombre",
        estado: resolverEstadoLicitacion(item),
        fechaCierre:
            fechas.FechaCierre ??
            item.FechaCierre ??
            item.fechaCierre ??
            null,
        fechaCreacion:
            fechas.FechaPublicacion ??
            item.FechaCreacion ??
            item.fechaPublicacion ??
            null,
        organismo:
            comprador.NombreOrganismo ??
            comprador.nombreOrganismo ??
            item.NombreOrganismo ??
            item.Organismo ??
            "Sin organismo",
        descripcion: item.Descripcion ?? item.descripcion ?? null,
        _raw: item,
    };
}

export function mapOrdenCompra(itemCrudo = {}) {
    const item = desempaquetarOrdenCompra(itemCrudo);
    const comprador = item?.Comprador ?? item?.comprador ?? {};
    const proveedor = item?.Proveedor ?? item?.proveedor ?? {};
    const fechas = item?.Fechas ?? {};

    return {
        id: item.Codigo ?? item.codigo ?? null,
        codigo: item.Codigo ?? item.codigo ?? null,
        proveedor:
            proveedor.Nombre ??
            proveedor.nombre ??
            item.NombreProveedor ??
            "Sin proveedor",
        comprador:
            comprador.NombreOrganismo ??
            comprador.nombreOrganismo ??
            item.NombreOrganismo ??
            item.Organismo ??
            "Sin organismo",
        montoTotal:
            item.TotalNeto ??
            item.MontoTotal ??
            item.montoTotal ??
            0,
        moneda: item.Moneda ?? item.moneda ?? "CLP",
        fecha:
            fechas.FechaCreacion ??
            item.FechaEmision ??
            item.Fecha ??
            item.fecha ??
            null,
        estado: resolverEstadoOrdenCompra(item),
        _raw: item,
    };
}