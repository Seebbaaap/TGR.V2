"use client";

import { useCallback, useEffect, useState } from "react";
import {
    MP_SYNC_READY_EVENT,
    yaSeSincronizoEnSesion,
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
        // Valor fijo en SSR y primer render del cliente; sessionStorage se lee en useEffect.
        sincronizando: true,
    });

    const cargarDesdeDb = useCallback(async () => {
        if (!modulo) return;

        try {
            setState((prev) => ({
                ...prev,
                loading: true,
                error: null,
                sincronizando: false,
            }));

            const res = await fetch(`/api/mercado-publico/${modulo}`, {
                method: "GET",
                cache: "no-store",
            });

            const json = await res.json();

            if (!res.ok) {
                setState({
                    data: [],
                    loading: false,
                    error: json?.error || "No se pudieron cargar los datos.",
                    total: 0,
                    sincronizando: false,
                });
                return;
            }

            const { filas, total, error } = normalizarRespuesta(json);

            setState({
                data: filas,
                loading: false,
                error,
                total,
                sincronizando: false,
            });
        } catch (error) {
            setState({
                data: [],
                loading: false,
                error: error?.message || "Error inesperado al leer Supabase.",
                total: 0,
                sincronizando: false,
            });
        }
    }, [modulo]);

    useEffect(() => {
        if (!modulo) return;

        function onSyncReady(event) {
            if (event?.detail?.ok === false) {
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    sincronizando: false,
                    error:
                        event.detail.error ||
                        "No se pudo sincronizar Mercado Público.",
                }));
                return;
            }

            cargarDesdeDb();
        }

        if (yaSeSincronizoEnSesion()) {
            cargarDesdeDb();
        } else {
            setState((prev) => ({
                ...prev,
                loading: true,
                sincronizando: true,
            }));
            window.addEventListener(MP_SYNC_READY_EVENT, onSyncReady);
        }

        return () => {
            window.removeEventListener(MP_SYNC_READY_EVENT, onSyncReady);
        };
    }, [modulo, cargarDesdeDb]);

    return state;
}
