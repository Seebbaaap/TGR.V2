"use client";

import { useEffect } from "react";
import {
    MP_SYNC_SESSION_KEY,
    marcarSincronizacionEnSesion,
    emitirSyncReady,
    emitirSyncProgress,
} from "@/lib/mercadoPublicoSession";

async function leerSyncConProgreso(onLinea) {
    const res = await fetch("/api/mercado-publico/sync?stream=1", {
        method: "POST",
        cache: "no-store",
    });

    if (!res.ok || !res.body) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || "Error sincronizando Mercado Público");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let ultimoDone = null;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lineas = buffer.split("\n");
        buffer = lineas.pop() ?? "";

        for (const linea of lineas) {
            if (!linea.trim()) continue;
            const msg = JSON.parse(linea);
            onLinea(msg);
            if (msg.type === "done") ultimoDone = msg;
        }
    }

    if (buffer.trim()) {
        const msg = JSON.parse(buffer);
        onLinea(msg);
        if (msg.type === "done") ultimoDone = msg;
    }

    if (!ultimoDone) {
        throw new Error("La sincronización terminó sin respuesta");
    }

    if (!ultimoDone.success) {
        throw new Error(ultimoDone.error || "Error sincronizando Mercado Público");
    }

    return ultimoDone;
}

export default function MercadoPublicoBootstrap() {
    useEffect(() => {
        if (sessionStorage.getItem(MP_SYNC_SESSION_KEY)) {
            return;
        }

        let cancelado = false;

        async function sincronizarEnSegundoPlano() {
            try {
                emitirSyncProgress({
                    mensaje: "Iniciando sincronización en segundo plano...",
                });

                const resultado = await leerSyncConProgreso((msg) => {
                    if (cancelado) return;
                    if (msg.type === "progress" && msg.mensaje) {
                        emitirSyncProgress({ mensaje: msg.mensaje, modulo: msg.modulo });
                    }
                });

                if (cancelado) return;

                marcarSincronizacionEnSesion();
                emitirSyncReady({ ok: true, cached: false, resultado });
            } catch (error) {
                if (cancelado) return;
                emitirSyncReady({ ok: false, error: error.message });
            }
        }

        sincronizarEnSegundoPlano();

        return () => {
            cancelado = true;
        };
    }, []);

    return null;
}
