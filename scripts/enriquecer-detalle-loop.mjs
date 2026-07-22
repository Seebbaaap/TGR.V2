/**
 * Loop local para enriquecer detalles pendientes de Mercado Público.
 *
 * Cada INTERVAL_MS segundos toma 1 pendiente del siguiente módulo
 * (licitaciones → compra-agil → ordenes-compra → …) y actualiza Supabase.
 *
 * Uso:
 *   npm run enriquecer:detalle
 *
 * Variables opcionales (.env.local o entorno):
 *   ENRIQUECER_INTERVAL_MS=2000   pausa entre cada detalle
 *   ENRIQUECER_LIMITE=1           detalles por ciclo (por módulo activo)
 *
 * Requiere: MERCADO_PUBLICO_TICKET, NEXT_PUBLIC_SUPABASE_URL,
 *           SUPABASE_SERVICE_ROLE_KEY
 *
 * Detener: Ctrl+C
 */

import { loadEnvLocal } from "./load-env.mjs";

loadEnvLocal();

const MODULOS = ["licitaciones", "compra-agil", "ordenes-compra"];
const INTERVAL_MS = Math.max(1000, Number(process.env.ENRIQUECER_INTERVAL_MS) || 2000);
const LIMITE = Math.max(1, Number(process.env.ENRIQUECER_LIMITE) || 1);

const { enriquecerDetalleMercadoPublico } = await import(
    "../services/mercado-publico/enriquecerDetalleMercadoPublico.js"
);

function esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function stamp() {
    return new Date().toLocaleString("es-CL", { hour12: false });
}

const totales = {
    ciclos: 0,
    ok: 0,
    error: 0,
    actualizado: 0,
    ya_tenia: 0,
    sin_cambio: 0,
    no_disponible: 0,
    sin_pendientes: 0,
};

let indiceModulo = 0;
let continuar = true;

function detener(senal) {
    console.log(`\n[${stamp()}] Señal ${senal}: deteniendo tras el ciclo actual…`);
    continuar = false;
}

process.on("SIGINT", () => detener("SIGINT"));
process.on("SIGTERM", () => detener("SIGTERM"));

console.log(`[${stamp()}] Inicio enriquecer-detalle-loop`);
console.log(`  intervalo=${INTERVAL_MS}ms  limite=${LIMITE}  módulos=${MODULOS.join(", ")}`);
console.log("  Ctrl+C para detener.\n");

while (continuar) {
    const modulo = MODULOS[indiceModulo % MODULOS.length];
    indiceModulo += 1;
    totales.ciclos += 1;

    try {
        const resultado = await enriquecerDetalleMercadoPublico({
            limite: LIMITE,
            pausaMs: 0,
            modulos: [modulo],
        });

        if (!resultado.procesados.length) {
            totales.sin_pendientes += 1;
            console.log(`[${stamp()}] [${modulo}] sin pendientes`);
        } else {
            for (const item of resultado.procesados) {
                if (item.ok) {
                    totales.ok += 1;
                    if (item.detalle in totales) totales[item.detalle] += 1;
                    console.log(
                        `[${stamp()}] OK [${item.modulo}] ${item.codigo} -> ${item.detalle}`
                    );
                } else {
                    totales.error += 1;
                    console.log(
                        `[${stamp()}] ERR [${item.modulo}] ${item.codigo} -> ${item.error || "error"}`
                    );
                }
            }
        }
    } catch (error) {
        totales.error += 1;
        console.error(`[${stamp()}] ERR [${modulo}] fallo del ciclo: ${error.message}`);
    }

    if (totales.ciclos % 30 === 0) {
        console.log(
            `[${stamp()}] — resumen: ciclos=${totales.ciclos} ok=${totales.ok} ` +
                `actualizado=${totales.actualizado} errores=${totales.error} ` +
                `sin_pendientes=${totales.sin_pendientes}`
        );
    }

    if (!continuar) break;
    await esperar(INTERVAL_MS);
}

console.log(`\n[${stamp()}] Fin.`);
console.log(
    `  ciclos=${totales.ciclos} ok=${totales.ok} actualizado=${totales.actualizado} ` +
        `ya_tenia=${totales.ya_tenia} errores=${totales.error} sin_pendientes=${totales.sin_pendientes}`
);
