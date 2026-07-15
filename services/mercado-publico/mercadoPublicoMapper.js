import { normalizarRegion } from "@/utils/normalizarRegion";

const ESTADOS_LICITACION = {
    5: "Publicada",
    6: "Cerrada",
    7: "Desierta",
    8: "Adjudicada",
    15: "En Evaluación",
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

function tieneDetalleCompraAgil(payload) {
    if (!payload || typeof payload !== "object") return false;
    return Boolean(
        payload.entrega?.direccion_entrega ||
        payload.convocatoria?.fecha_cierre_primer_llamado ||
        (Array.isArray(payload.productos_solicitados) && payload.productos_solicitados.length > 0)
    );
}

function tieneDetalleOrdenCompra(payload) {
    if (!payload || typeof payload !== "object") return false;
    return Boolean(
        payload.Comprador?.NombreUnidad ||
        payload.Proveedor?.Actividad ||
        (Array.isArray(payload.Items?.Listado) && payload.Items.Listado.length > 0)
    );
}

function mapItemsOrdenCompra(item) {
    const listado = item?.Items?.Listado ?? [];
    if (!Array.isArray(listado)) return [];
    return listado.map((it) => ({
        codigoProducto: it.CodigoProducto ?? null,
        producto: it.Producto ?? null,
        especificacionComprador: it.EspecificacionComprador ?? null,
        cantidad: it.Cantidad ?? null,
        precioNeto: it.PrecioNeto ?? null,
        totalImpuestos: it.TotalImpuestos ?? null,
        total: it.Total ?? null,
    }));
}

function mapProductosCompraAgil(productos) {
    if (!Array.isArray(productos)) return [];
    return productos.map((p) => ({
        codigoProducto: p.codigo_producto ?? null,
        nombre: p.nombre ?? null,
        descripcion: p.descripcion ?? null,
        cantidad: p.cantidad ?? null,
    }));
}

export function tieneDetalleEnPayload(modulo, payload) {
    if (!payload || typeof payload !== "object") return false;
    if (modulo === "licitaciones") return Boolean(payload.Comprador);
    if (modulo === "ordenes-compra") return tieneDetalleOrdenCompra(payload);
    if (modulo === "compra-agil") return tieneDetalleCompraAgil(payload);
    return false;
}

export { tieneDetalleCompraAgil };

export function mapCompraAgil(item = {}) {
    if (item.codigo && !item.CodigoExterno) {
        const estado = item.estado ?? {};
        const fechas = item.fechas ?? {};
        const presupuesto = item.presupuesto ?? item.montos ?? {};
        const institucion = item.institucion ?? {};
        const convocatoria = item.convocatoria ?? {};
        const entrega = item.entrega ?? {};
        const resumen = item.resumen ?? {};
        const organismo = institucion.organismo_comprador;

        return {
            id: item.codigo,
            codigo: item.codigo,
            nombre: item.nombre ?? "Sin nombre",
            estado: estado.glosa ?? estado.codigo ?? "Sin estado",
            estadoConvocatoria: convocatoria.descripcion ?? null,
            fechaCierrePrimerLlamado: convocatoria.fecha_cierre_primer_llamado ?? null,
            fechaCierreSegundoLlamado: convocatoria.fecha_cierre_segundo_llamado ?? null,
            fechaCreacion: fechas.fecha_publicacion ?? null,
            fechaCierre: fechas.fecha_cierre ?? null,
            fechaCancelacion: fechas.fecha_cancelacion ?? null,
            direccionEntrega: entrega.direccion_entrega ?? null,
            plazoEntregaDias: entrega.plazo_entrega_dias ?? null,
            organismo:
                typeof organismo === "string"
                    ? organismo
                    : organismo?.nombre ?? "Sin organismo",
            region: normalizarRegion(
                institucion.nombre_region ?? institucion.region
            ),
            monto:
                presupuesto.presupuesto_estimado ??
                presupuesto.monto_disponible_clp ??
                presupuesto.monto_disponible ??
                0,
            moneda: presupuesto.moneda ?? "CLP",
            descripcion: item.descripcion ?? null,
            totalOfertasRecibidas: resumen.total_ofertas_recibidas ?? null,
            productos: mapProductosCompraAgil(item.productos_solicitados),
            _raw: item,
        };
    }

    return {
        id: item.CodigoExterno ?? item.ID ?? null,
        codigo: item.CodigoExterno ?? null,
        nombre: item.Nombre ?? item.NombreProducto ?? "Sin nombre",
        estado: item.Estado ?? "Sin estado",
        fechaCreacion: item.FechaCreacion ?? null,
        fechaCierre: item.FechaCierre ?? null,
        organismo: item.NombreOrganismo ?? item.Organismo ?? "Sin organismo",
        region: normalizarRegion(item.Region),
        monto: item.MontoEstimado ?? item.Monto ?? 0,
        moneda: item.Moneda ?? "CLP",
        descripcion: item.Descripcion ?? null,
        _raw: item,
    };
}

function mapItemsLicitacion(item) {
    const listado = item?.Items?.Listado ?? [];
    if (!Array.isArray(listado)) return [];
    return listado.map((it) => ({
        codigoProducto: it.CodigoProducto ?? null,
        nombreProducto: it.NombreProducto ?? null,
        descripcion: it.Descripcion ?? null,
        cantidad: it.Cantidad ?? null,
    }));
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
            null,
        nombreUnidad: comprador.NombreUnidad ?? null,
        direccionUnidad: comprador.DireccionUnidad ?? null,
        regionUnidad: comprador.RegionUnidad ?? null,
        cantidadReclamos: item.CantidadReclamos ?? null,
        fechaInicio: fechas.FechaInicio ?? null,
        fechaFinal: fechas.FechaFinal ?? null,
        montoEstimado: item.MontoEstimado ?? null,
        moneda: item.Moneda ?? "CLP",
        descripcion: item.Descripcion ?? item.descripcion ?? null,
        items: mapItemsLicitacion(item),
        _raw: item,
    };
}

export function mapOrdenCompra(itemCrudo = {}) {
    const item = desempaquetarOrdenCompra(itemCrudo);
    const comprador = item?.Comprador ?? item?.comprador ?? {};
    const proveedor = item?.Proveedor ?? item?.proveedor ?? {};
    const fechas = item?.Fechas ?? {};
    const items = item?.Items ?? {};

    return {
        id: item.Codigo ?? item.codigo ?? null,
        codigo: item.Codigo ?? item.codigo ?? null,
        nombre: item.Nombre ?? item.nombre ?? null,
        estado: resolverEstadoOrdenCompra(item),
        codigoLicitacion: item.CodigoLicitacion ?? null,
        descripcion: item.Descripcion ?? item.descripcion ?? null,
        totalNeto: item.TotalNeto ?? null,
        impuestos: item.Impuestos ?? null,
        total: item.Total ?? null,
        proveedor:
            proveedor.Nombre ??
            proveedor.nombre ??
            item.NombreProveedor ??
            null,
        actividadProveedor: proveedor.Actividad ?? null,
        direccionProveedor: proveedor.Direccion ?? null,
        comunaProveedor: proveedor.Comuna ?? null,
        regionProveedor: proveedor.Region ?? null,
        comprador:
            comprador.NombreOrganismo ??
            comprador.nombreOrganismo ??
            item.NombreOrganismo ??
            item.Organismo ??
            null,
        nombreUnidad: comprador.NombreUnidad ?? null,
        actividadComprador: comprador.Actividad ?? null,
        direccionUnidad: comprador.DireccionUnidad ?? null,
        comunaUnidad: comprador.ComunaUnidad ?? null,
        regionUnidad: comprador.RegionUnidad ?? null,
        cantidadItems: items.Cantidad ?? null,
        items: mapItemsOrdenCompra(item),
        montoTotal:
            item.Total ??
            item.TotalNeto ??
            item.MontoTotal ??
            item.montoTotal ??
            0,
        moneda: item.TipoMoneda ?? item.Moneda ?? item.moneda ?? "CLP",
        fecha:
            fechas.FechaCreacion ??
            fechas.FechaEnvio ??
            item.FechaEmision ??
            item.Fecha ??
            item.fecha ??
            null,
        _raw: item,
    };
}