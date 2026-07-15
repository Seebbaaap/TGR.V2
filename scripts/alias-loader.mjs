import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");

function resolverAlias(specifier) {
    const rel = specifier.slice(2);
    const base = path.join(ROOT, rel);

    const candidatos = [
        base,
        `${base}.js`,
        `${base}.mjs`,
        `${base}.jsx`,
        path.join(base, "index.js"),
    ];

    for (const candidato of candidatos) {
        try {
            if (fs.existsSync(candidato) && fs.statSync(candidato).isFile()) {
                return pathToFileURL(candidato).href;
            }
        } catch {
            // siguiente candidato
        }
    }

    return pathToFileURL(`${base}.js`).href;
}

export async function resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
        return nextResolve(resolverAlias(specifier), context);
    }
    return nextResolve(specifier, context);
}
