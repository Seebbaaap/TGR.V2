import { NextResponse } from "next/server";

const SII_URL = "https://www4.sii.cl/mapasui/services/data/mapasFacadeService/getPredioNacional";
const FASTAPI_URL = "https://tgr-agua-production.up.railway.app";

const COMUNAS_SII = {
    "AISEN": 11101, "ALTO BIOBIO": 8314, "ALTO HOSPICIO": 1107, "ALGARROBO": 5603,
    "ANCUD": 10102, "ANDACOLLO": 4102, "ANGOL": 9201, "ANTOFAGASTA": 2101,
    "ARAUCO": 8202, "ARICA": 15101, "AYSEN": 11101, "CALAMA": 2201,
    "CALBUCO": 10302, "CALDERA": 3101, "CALERA": 5502, "CALLE LARGA": 5302,
    "CARAHUE": 9102, "CARTAGENA": 5604, "CASABLANCA": 5102, "CASTRO": 10101,
    "CAUQUENES": 7201, "CERRILLOS": 13102, "CHAITÉN": 10401, "CHAITEN": 10401,
    "CHAÑARAL": 3201, "CHANARAL": 3201, "CHEPICA": 6302, "CHILE CHICO": 11201,
    "CHILLAN": 16101, "CHILLÁN": 16101, "CHILLAN VIEJO": 16102, "CHIMBARONGO": 6303,
    "COCHRANE": 11301, "COIHAIQUE": 11101, "COLBUN": 7301, "COLINA": 13301,
    "CONCEPCION": 8101, "CONSTITUCION": 7101, "COPIAPO": 3101, "COQUIMBO": 4101,
    "CORONEL": 8102, "CURICO": 7101, "CURICÓ": 7101, "CABRERO": 8310,
    "COYHAIQUE": 11101, "OSORNO": 10301, "SAN JOAQUIN": 13129,
    "EL BOSQUE": 13105, "ERCILLA": 9204, "FLORIDA": 8103, "FREIRE": 9104,
    "GALVARINO": 9105, "GRANEROS": 6104, "HIJUELAS": 5504, "ILLAPEL": 4301,
    "IQUIQUE": 1101, "LA LIGUA": 5401, "LA SERENA": 4101, "LA UNION": 14201,
    "LAMPA": 13302, "LANCO": 14103, "LAUTARO": 9106, "LEBU": 8205,
    "LINARES": 7302, "LOS ANDES": 5301, "LOS ANGELES": 8301, "LOTA": 8104,
    "MAIPU": 13119, "MAIPÚ": 13119, "MELIPILLA": 13501, "MOLINA": 7204,
    "MULCHEN": 8303, "NACIMIENTO": 8304, "NUEVA IMPERIAL": 9108, "OVALLE": 4201,
    "PARRAL": 7305, "PICHILEMU": 6201, "PROVIDENCIA": 13122, "PUCON": 9112,
    "PUERTO MONTT": 10301, "PUNTA ARENAS": 12101, "QUILICURA": 13124,
    "QUILLOTA": 5501, "QUILPUE": 5510, "RANCAGUA": 6101, "RETIRO": 7306,
    "SAN ANTONIO": 5601, "SAN BERNARDO": 13401, "SAN FELIPE": 5301,
    "SAN FERNANDO": 6301, "SANTIAGO": 13101, "TALCA": 7101, "TALCAHUANO": 8110,
    "TALTAL": 2103, "TEMUCO": 9101, "TOME": 8111, "VALDIVIA": 14101,
    "VALLENAR": 3301, "VALPARAISO": 5101, "VIÑA DEL MAR": 5109,
    "VINA DEL MAR": 5109, "VILLARRICA": 9116, "VILLA ALEGRE": 7309,
    "YUNGAY": 16216, "PAREDONES": 6205,
};

function obtenerCodigoComuna(nombre) {
    const upper = nombre.toUpperCase().trim();
    if (COMUNAS_SII[upper]) return COMUNAS_SII[upper];
    for (const [key, codigo] of Object.entries(COMUNAS_SII)) {
        if (key.includes(upper) || upper.includes(key)) return codigo;
    }
    return null;
}

async function geocodificarSII(rolFormato) {
    const partes = rolFormato.split("-");
    if (partes.length < 3) return { error: "Formato de rol inválido" };

    const nombreComuna = partes[0].trim();
    const manzana = String(parseInt(partes[1])).padStart(5, "0");
    const predio = String(parseInt(partes[2])).padStart(3, "0");
    const codigoComuna = obtenerCodigoComuna(nombreComuna);

    if (!codigoComuna) return { error: `Comuna no encontrada: ${nombreComuna}` };

    const payload = {
        metaData: {
            namespace: "cl.sii.sdi.lob.bbrr.mapas.data.api.interfaces.MapasFacadeService/getPredioNacional",
            conversationId: "UNAUTHENTICATED-CALL",
            transactionId: "estadohub-001",
        },
        data: {
            predio: { comuna: String(codigoComuna), manzana, predio },
            servicios: [],
        },
    };

    try {
        const resp = await fetch(SII_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://www4.sii.cl/mapasui/internet/",
                "Origin": "https://www4.sii.cl",
            },
            body: JSON.stringify(payload),
        });

        const data = await resp.json();
        const predioData = data?.data;

        if (!predioData?.existePredio) {
            return { error: "No se encontraron datos en el SII para esta propiedad." };
        }

        const lat = predioData.ubicacionX;
        const lon = predioData.ubicacionY;

        if (!lat || !lon) return { error: "SII no devolvió coordenadas para este predio." };

        return {
            lat, lon,
            ubicacion: predioData.ubicacion || "",
            destino: predioData.destinoDescripcion || "",
        };
    } catch (e) {
        return { error: `Error consultando SII: ${e.message}` };
    }
}

async function consultarDGA(lat, lon) {
    const BASE = "https://rest-sit.mop.gov.cl/arcgis/rest/services";
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://dga.mop.gob.cl/",
        "Accept": "application/json, text/plain, */*",
    };

    let pozos500m = 0, pozos2km = 0, caudalPromedio = 0;
    let zonaProhibicion = false, zonaRestriccion = false, nombreZona = "";
    let errorDGA = "";

    try {
        const params = new URLSearchParams({
            geometry: `${lon},${lat}`,
            geometryType: "esriGeometryPoint",
            inSR: "4326",
            spatialRel: "esriSpatialRelIntersects",
            distance: "2000",
            units: "esriSRUnit_Meter",
            outFields: "TIPO_FUENTE,CAUDAL_MEDIO,PROF_POZO,ESTADO,EXPEDIENTE",
            returnGeometry: "true",
            outSR: "4326",
            f: "json",
        });

        const resp = await fetch(`${BASE}/SNIA/SNIA_DerechoAprovechamiento/MapServer/0/query?${params}`, { headers });
        const data = await resp.json();
        const features = data.features || [];

        const caudales = [];
        for (const feat of features) {
            const attrs = feat.attributes || {};
            const geom = feat.geometry || {};
            const tipoFuente = (attrs.TIPO_FUENTE || "").toUpperCase();
            if (tipoFuente && !tipoFuente.includes("SUB")) continue;

            const dLat = lat - (geom.y || lat);
            const dLon = lon - (geom.x || lon);
            const distM = Math.sqrt(dLat * dLat + dLon * dLon) * 111000;

            if (distM <= 500) pozos500m++;
            pozos2km++;

            const caudal = attrs.CAUDAL_MEDIO;
            if (caudal && caudal > 0) caudales.push(caudal);
        }

        if (caudales.length) caudalPromedio = caudales.reduce((a, b) => a + b, 0) / caudales.length;
    } catch {
        errorDGA = "Servicio DGA temporalmente no disponible.";
    }

    try {
        const params = new URLSearchParams({
            geometry: `${lon},${lat}`,
            geometryType: "esriGeometryPoint",
            inSR: "4326",
            spatialRel: "esriSpatialRelIntersects",
            outFields: "TIPO,NOMBREAREA",
            returnGeometry: "false",
            f: "json",
        });

        const resp = await fetch(`${BASE}/DGA/Areas_Restriccion_Zonas_prohibicion/MapServer/0/query?${params}`, { headers });
        const data = await resp.json();

        for (const feat of (data.features || [])) {
            const attrs = feat.attributes || {};
            const tipo = (attrs.TIPO || "").toUpperCase();
            if (tipo.includes("PROHIBICION") || tipo.includes("PROHIBICIÓN")) zonaProhibicion = true;
            else if (tipo.includes("RESTRICCION") || tipo.includes("RESTRICCIÓN")) zonaRestriccion = true;
            if (attrs.NOMBREAREA) nombreZona = attrs.NOMBREAREA;
        }
    } catch { /* restricciones falló silenciosamente */ }

    return { pozos500m, pozos2km, caudalPromedio, zonaProhibicion, zonaRestriccion, nombreZona, errorDGA };
}

async function consultarTopografia(lat, lon) {
    const DELTA = 0.0015;
    const puntos = [
        [lat, lon], [lat + DELTA, lon], [lat - DELTA, lon],
        [lat, lon + DELTA], [lat, lon - DELTA],
    ];
    const locations = puntos.map(([la, lo]) => `${la},${lo}`).join("|");

    try {
        const resp = await fetch(`https://api.opentopodata.org/v1/srtm30m?locations=${locations}`);
        const data = await resp.json();
        const elevaciones = (data.results || []).map(r => r.elevation || 0);
        if (elevaciones.length < 5) return { elevacion: 0, pendiente: 0, posicion: "DESCONOCIDO" };

        const [centro, norte, sur, este, oeste] = elevaciones;
        const distM = DELTA * 111000;
        const pendienteMax = Math.max(
            Math.abs(centro - norte), Math.abs(centro - sur),
            Math.abs(centro - este), Math.abs(centro - oeste)
        ) / distM * 100;

        const vecinosMasAltos = [norte, sur, este, oeste].filter(v => v > centro).length;

        return {
            elevacion: Math.round(centro),
            pendiente: Math.round(pendienteMax * 10) / 10,
            posicion: vecinosMasAltos >= 2 ? "VALLE" : "CERRO",
        };
    } catch {
        return { elevacion: 0, pendiente: 0, posicion: "DESCONOCIDO" };
    }
}

function calcularScore(dga, ubicacion, destino, pendiente, posicion) {
    let score = 0;

    if (dga.pozos500m >= 3) score += 40;
    else if (dga.pozos500m >= 1) score += 30;
    else if (dga.pozos2km >= 3) score += 20;
    else if (dga.pozos2km >= 1) score += 10;

    if (dga.caudalPromedio >= 5) score += 10;
    else if (dga.caudalPromedio >= 1) score += 5;

    if (posicion === "VALLE") score += 20;
    else score += 5;

    if (pendiente < 3) score += 10;
    else if (pendiente < 8) score += 5;

    const destinoUpper = (destino || "").toUpperCase();
    if (destinoUpper.includes("AGRICOLA") || destinoUpper.includes("AGRÍCOLA")) score += 20;
    else if (ubicacion === "RURAL") score += 10;

    return Math.min(score, 100);
}

function calcularOportunidad(montoMinimo, montoAvaluo) {
    if (!montoMinimo || !montoAvaluo) return null;
    const ratio = montoMinimo / montoAvaluo;
    const descuento = Math.round((1 - ratio) * 100);
    let nivel = "NORMAL";
    if (descuento >= 40) nivel = "ALTA";
    else if (descuento >= 20) nivel = "MEDIA";
    return { ratio: Math.round(ratio * 100) / 100, descuento, nivel };
}

function calcularAntiguedadDeuda(periodoDesde) {
    if (!periodoDesde) return null;
    const partes = periodoDesde.split("-");
    if (partes.length < 2) return null;
    const [mes, anio] = partes;
    const fechaDesde = new Date(parseInt(anio), parseInt(mes) - 1);
    const hoy = new Date();
    const meses = (hoy.getFullYear() - fechaDesde.getFullYear()) * 12 +
        (hoy.getMonth() - fechaDesde.getMonth());
    const anios = Math.floor(meses / 12);
    let nivel = "RECIENTE";
    if (anios >= 5) nivel = "MUY ANTIGUA";
    else if (anios >= 3) nivel = "ANTIGUA";
    else if (anios >= 1) nivel = "MODERADA";
    return { meses, anios, nivel };
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const rolFormato = searchParams.get("rol");
    const montoMinimo = parseFloat(searchParams.get("montoMinimo") || "0");
    const montoAvaluo = parseFloat(searchParams.get("montoAvaluo") || "0");
    const periodoDesde = searchParams.get("periodoDesde") || "";

    if (!rolFormato) {
        return NextResponse.json({ error: "Falta parámetro rol" }, { status: 400 });
    }

    // 1. SII
    const geo = await geocodificarSII(rolFormato);
    if (geo.error) {
        return NextResponse.json({ error: geo.error }, { status: 422 });
    }

    // 2. DGA
    const dga = await consultarDGA(geo.lat, geo.lon);

    // 3. Topografía
    const topo = await consultarTopografia(geo.lat, geo.lon);

    // 4. Score agua
    const scoreAgua = calcularScore(dga, geo.ubicacion, geo.destino, topo.pendiente, topo.posicion);
    const nivelAgua = scoreAgua >= 70 ? "ALTO" : scoreAgua >= 40 ? "MEDIO" : "BAJO";
    const puedePerforar = !dga.zonaProhibicion;

    // 5. Score oportunidad
    const oportunidad = calcularOportunidad(montoMinimo, montoAvaluo);

    // 6. Antigüedad deuda
    const antiguedad = calcularAntiguedadDeuda(periodoDesde);

    return NextResponse.json({
        coordenadas: { lat: geo.lat, lon: geo.lon },
        ubicacion: geo.ubicacion,
        destino: geo.destino,
        agua: {
            score: scoreAgua,
            nivel: nivelAgua,
            puedePerforar,
            pozos500m: dga.pozos500m,
            pozos2km: dga.pozos2km,
            caudalPromedio: Math.round(dga.caudalPromedio * 100) / 100,
            zonaProhibicion: dga.zonaProhibicion,
            zonaRestriccion: dga.zonaRestriccion,
            nombreZona: dga.nombreZona,
            elevacion: topo.elevacion,
            pendiente: topo.pendiente,
            posicion: topo.posicion,
            errorDGA: dga.errorDGA,
        },
        oportunidad,
        antiguedad,
    });
}