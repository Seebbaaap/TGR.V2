import { getRematesActivos } from "@/services/tgr/rematesService";
import FichaPropiedadWrapper from "./FichaPropiedadWrapper";
import ErrorBanner from "@/components/shared/ErrorBanner";
import { notFound } from "next/navigation";

export default async function FichaPropiedadPage({ params }) {
    const { rol } = await params;
    const rolFormato = decodeURIComponent(rol);

    let remate = null;
    let analisis = null;
    let errorAnalisis = null;

    // 1. Buscar el remate en los datos de TGR
    try {
        const datos = await getRematesActivos();
        remate = datos.find(d => (d._raw?.rolFormato || "") === rolFormato);
    } catch {
        return <ErrorBanner mensaje="No se pudieron obtener los remates desde TGR." />;
    }

    if (!remate) return notFound();

    // 2. Ejecutar análisis automáticamente
    try {
        const raw = remate._raw || {};
        const params = new URLSearchParams({
            rol:          rolFormato,
            montoMinimo:  String(remate.montoMinimo || 0),
            montoAvaluo:  String(remate.montoAvaluo || 0),
            periodoDesde: remate.periodoDesde || "",
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const resp = await fetch(`${baseUrl}/api/analisis-agua?${params}`, {
            cache: "no-store",
        });

        if (resp.ok) {
            analisis = await resp.json();
        } else {
            const err = await resp.json();
            errorAnalisis = err.error || "Error al analizar la propiedad.";
        }
    } catch (e) {
        errorAnalisis = "No se pudo conectar con el servicio de análisis.";
    }

    return <FichaPropiedadWrapper remate={remate} analisis={analisis} errorAnalisis={errorAnalisis} rolFormato={rolFormato} />;
}