import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function limpiarDireccion(direccion) {
    if (!direccion) return "";
    return direccion
        .replace(/\bS\/N\b/gi, "")
        .replace(/\bLOTE\s*\d+/gi, "")
        .replace(/\bSITIO\s*\d+/gi, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}

async function geocodificarConGoogle(query) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        throw new Error("GOOGLE_MAPS_API_KEY no está definida");
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}&region=cl&language=es`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
        throw new Error(`Error HTTP ${res.status} al consultar Google Geocoding`);
    }

    const data = await res.json();

    if (data.status !== "OK" || !data.results?.length) {
        return null;
    }

    const result = data.results[0];
    const location = result.geometry?.location;

    if (!location) return null;

    return {
        lat: Number(location.lat),
        lng: Number(location.lng),
        fuente: "google",
        precision: result.geometry?.location_type || "desconocida",
        direccionFormateada: result.formatted_address || query,
    };
}

export async function obtenerCoordsExactas({ rol, direccion, comuna }) {
    const supabase = getSupabaseAdmin();

    const { data: existente, error: errorSelect } = await supabase
        .from("remates_geo")
        .select("lat,lng,fuente,precision")
        .eq("rol", rol)
        .maybeSingle();

    if (errorSelect) {
        throw new Error(errorSelect.message);
    }

    if (existente?.lat && existente?.lng) {
        return {
            lat: existente.lat,
            lng: existente.lng,
            fuente: existente.fuente || "cache",
            precision: existente.precision || "desconocida",
        };
    }

    const direccionLimpia = limpiarDireccion(direccion);
    const query = [direccionLimpia, comuna, "Chile"].filter(Boolean).join(", ");
    if (!query) return null;

    const coords = await geocodificarConGoogle(query);
    if (!coords) return null;

    const { error: errorUpsert } = await supabase
        .from("remates_geo")
        .upsert({
            rol,
            direccion,
            comuna,
            lat: coords.lat,
            lng: coords.lng,
            fuente: coords.fuente,
            precision: coords.precision,
            actualizado_en: new Date().toISOString(),
        });

    if (errorUpsert) {
        throw new Error(errorUpsert.message);
    }

    return {
        lat: coords.lat,
        lng: coords.lng,
        fuente: coords.fuente,
        precision: coords.precision,
    };
}