import { getRematesActivos } from "@/services/tgr/rematesService";
import { upsertRemates } from "@/services/supabase/rematesRepo";

export async function syncRematesTGR() {
  const raw = await getRematesActivos();
  
  // Por si la API devuelve un objeto { data: [...] } en lugar del arreglo directo
  const lista = Array.isArray(raw) ? raw : (raw.data || []);

  const datosLimpios = lista.map((item) => {
    // RED DE CAPTURA: Abrimos la caja fuerte original de la TGR si tu compañero la dejó
    let tgr = {};
    if (item._raw) {
      tgr = typeof item._raw === "string" ? JSON.parse(item._raw) : item._raw;
    } else {
      tgr = item;
    }

    return {
      rol: tgr.rol || item.rol,
      
      nombre_dueno: tgr.nombreDuegno || item.nombre_dueno || item.deudor || "Sin información",
      
      direccion: tgr.direccionRol || item.direccion || "Sin dirección",
      
      comuna: tgr.comunaJuzgado || item.comuna || "Sin comuna",
      
      // Busca primero en el original (nombreJuzgado), luego en el alterado
      tribunal: tgr.nombreJuzgado || item.tribunal || item.juzgado || "Sin tribunal",
      
      fecha_remate: tgr.fechaRemate || item.fecha_remate,
      
      monto_avaluo: Number(tgr.avaluo || item.monto_avaluo || item.avaluo || 0),
      
      monto_minimo: Number(tgr.tasacion || item.monto_minimo || item.tasacion || item.minimo || 0)
    };
  });

  // Eliminar duplicados para evitar el error de base de datos
  const rematesUnicos = Array.from(
    new Map(datosLimpios.map((item) => [item.rol, item])).values()
  );

  // Enviar a Supabase
  await upsertRemates(rematesUnicos);
  
  return { sincronizados: rematesUnicos.length };
}
