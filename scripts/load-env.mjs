import fs from "node:fs";
import path from "node:path";

/**
 * Carga variables desde .env.local (y opcionalmente .env)
 * sin pisar lo que ya venga en process.env.
 */
export function loadEnvLocal(rootDir = path.resolve(import.meta.dirname, "..")) {
    const archivos = [".env.local", ".env"];

    for (const nombre of archivos) {
        const archivo = path.join(rootDir, nombre);
        if (!fs.existsSync(archivo)) continue;

        const contenido = fs.readFileSync(archivo, "utf8");
        for (const lineaCruda of contenido.split(/\r?\n/)) {
            const linea = lineaCruda.trim();
            if (!linea || linea.startsWith("#")) continue;

            const eq = linea.indexOf("=");
            if (eq <= 0) continue;

            const clave = linea.slice(0, eq).trim();
            let valor = linea.slice(eq + 1).trim();
            if (
                (valor.startsWith('"') && valor.endsWith('"')) ||
                (valor.startsWith("'") && valor.endsWith("'"))
            ) {
                valor = valor.slice(1, -1);
            }

            if (process.env[clave] === undefined) {
                process.env[clave] = valor;
            }
        }
    }
}
