"use client";

import { useEffect } from "react";
import {
    MP_SYNC_SESSION_KEY,
    marcarSincronizacionEnSesion,
    emitirSyncReady,
} from "@/lib/mercadoPublicoSession";

export default function MercadoPublicoBootstrap() {
    useEffect(() => {
        if (sessionStorage.getItem(MP_SYNC_SESSION_KEY)) {
            emitirSyncReady({ ok: true, cached: true });
            return;
        }

        let cancelado = false;

        async function sincronizar() {
            try {
                const res = await fetch("/api/mercado-publico/sync", {
                    method: "POST",
                    cache: "no-store",
                });

                const json = await res.json();

                if (cancelado) return;

                if (!res.ok || json?.success === false) {
                    throw new Error(json?.error || "Error sincronizando Mercado Público");
                }

                marcarSincronizacionEnSesion();
                emitirSyncReady({ ok: true, cached: false, resultado: json });
            } catch (error) {
                if (cancelado) return;
                emitirSyncReady({ ok: false, error: error.message });
            }
        }

        sincronizar();

        return () => {
            cancelado = true;
        };
    }, []);

    return null;
}