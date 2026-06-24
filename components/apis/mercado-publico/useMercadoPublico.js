"use client";

import { useEffect, useState } from "react";

function normalizarRespuesta(json) {
    const filas =
        Array.isArray(json?.todasLasFilas) && json.todasLasFilas.length > 0
            ? json.todasLasFilas
            : Array.isArray(json?.filas)
              ? json.filas
              : Array.isArray(json?.data)
                ? json.data
                : [];

    const total = Number(
        json?.totalRegistros ?? json?.total ?? filas.length ?? 0
    );

    const fecha = json?.fecha ?? json?.fechaUsada ?? null;
    const desdeDb = Boolean(json?.desdeDb ?? json?.desdeCache);

    let error = null;

    if (json?.error) {
        error = json.error;
    } else if (json?.ok === false) {
        error = json?.mensaje || "Sin datos disponibles.";
    } else if (filas.length === 0 && json?.success === false) {
        error = json?.error || "No se pudieron cargar los datos.";
    }

    return { filas, total, fecha, error, desdeDb };
}

export function useMercadoPublico(modulo) {
    const [state, setState] = useState({
        data: [],
        loading: true,
        error: null,
        fecha: null,
        total: 0,
        desdeDb: false,
    });

    useEffect(() => {
        if (!modulo) return;

        let cancelado = false;

        async function cargar() {
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

                if (cancelado) return;

                if (!res.ok) {
                    setState({
                        data: [],
                        loading: false,
                        error:
                            json?.error ||
                            json?.mensaje ||
                            "No se pudieron cargar los datos.",
                        fecha: json?.fecha ?? json?.fechaUsada ?? null,
                        total: 0,
                        desdeDb: false,
                    });
                    return;
                }

                const { filas, total, fecha, error, desdeDb } =
                    normalizarRespuesta(json);

                setState({
                    data: filas,
                    loading: false,
                    error,
                    fecha,
                    total,
                    desdeDb,
                });
            } catch (error) {
                if (cancelado) return;

                setState({
                    data: [],
                    loading: false,
                    error:
                        error?.message ||
                        "Error inesperado al consultar Mercado Público.",
                    fecha: null,
                    total: 0,
                    desdeDb: false,
                });
            }
        }

        cargar();

        return () => {
            cancelado = true;
        };
    }, [modulo]);

    return state;
}