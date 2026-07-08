"use client";

import { useCallback, useEffect, useState } from "react";

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
    });

    const cargarDesdeDb = useCallback(async () => {
        if (!modulo) return;

        try {
            setState((prev) => ({
                ...prev,
                loading: true,
                error: null,
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
                });
                return;
            }

            const { filas, total, error } = normalizarRespuesta(json);

            setState({
                data: filas,
                loading: false,
                error,
                total,
            });
        } catch (error) {
            setState({
                data: [],
                loading: false,
                error: error?.message || "Error inesperado al leer Supabase.",
                total: 0,
            });
        }
    }, [modulo]);

    useEffect(() => {
        if (!modulo) return;
        cargarDesdeDb();
    }, [modulo, cargarDesdeDb]);

    return state;
}
