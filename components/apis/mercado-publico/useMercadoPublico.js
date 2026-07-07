"use client";

import { useCallback, useEffect, useState } from "react";
import {
    MP_SYNC_PROGRESS_EVENT,
    MP_SYNC_READY_EVENT,
} from "@/lib/mercadoPublicoSession";

function normalizarRespuesta(json) {
    const filas = Array.isArray(json?.filas) ? json.filas : [];

    const total = Number(json?.totalRegistros ?? filas.length ?? 0);

    let error = null;

    if (json?.error) {
        error = json.error;
    }

    return { filas, total, error };
}

export function useMercadoPublico(modulo) {
    const [state, setState] = useState({
        data: [],
        loading: true,
        error: null,
        total: 0,
        sincronizando: false,
        mensajeSync: null,
        errorSync: null,
    });

    const cargarDesdeDb = useCallback(async ({ silencioso = false } = {}) => {
        if (!modulo) return;

        try {
            setState((prev) => ({
                ...prev,
                loading: !silencioso,
                error: silencioso ? prev.error : null,
            }));

            const res = await fetch(`/api/mercado-publico/${modulo}`, {
                method: "GET",
                cache: "no-store",
            });

            const json = await res.json();

            if (!res.ok) {
                setState((prev) => ({
                    ...prev,
                    data: [],
                    loading: false,
                    error: json?.error || "No se pudieron cargar los datos.",
                    total: 0,
                }));
                return;
            }

            const { filas, total, error } = normalizarRespuesta(json);

            setState((prev) => ({
                ...prev,
                data: filas,
                loading: false,
                error,
                total,
            }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                data: [],
                loading: false,
                error: error?.message || "Error inesperado al leer Supabase.",
                total: 0,
            }));
        }
    }, [modulo]);

    useEffect(() => {
        if (!modulo) return;

        // primero mostramos lo que ya hay en supabase, sin esperar al sync
        cargarDesdeDb();

        function onSyncProgress(event) {
            setState((prev) => ({
                ...prev,
                sincronizando: true,
                mensajeSync: event.detail?.mensaje ?? prev.mensajeSync,
                errorSync: null,
            }));
        }

        function onSyncReady(event) {
            if (event?.detail?.ok === false) {
                setState((prev) => ({
                    ...prev,
                    sincronizando: false,
                    mensajeSync: null,
                    errorSync:
                        event.detail.error ||
                        "No se pudo sincronizar Mercado Público.",
                }));
                return;
            }

            setState((prev) => ({
                ...prev,
                sincronizando: false,
                mensajeSync: null,
                errorSync: null,
            }));

            // cuando el sync termina, refrescamos la tabla sin bloquear la ui
            cargarDesdeDb({ silencioso: true });
        }

        window.addEventListener(MP_SYNC_PROGRESS_EVENT, onSyncProgress);
        window.addEventListener(MP_SYNC_READY_EVENT, onSyncReady);

        return () => {
            window.removeEventListener(MP_SYNC_PROGRESS_EVENT, onSyncProgress);
            window.removeEventListener(MP_SYNC_READY_EVENT, onSyncReady);
        };
    }, [modulo, cargarDesdeDb]);

    return state;
}
