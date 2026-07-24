"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_SIZE_DEFAULT = 5;
const DEBOUNCE_MS = 350;

function normalizarRespuesta(json) {
    const filas = Array.isArray(json?.filas) ? json.filas : [];
    const total = Number(json?.totalRegistros ?? 0);
    const totalFiltrados = Number(json?.totalFiltrados ?? filas.length ?? 0);
    const estados = Array.isArray(json?.estados) ? json.estados : [];
    const regiones = Array.isArray(json?.regiones) ? json.regiones : [];
    const pagina = Number(json?.pagina ?? 1);
    const pageSize = Number(json?.pageSize ?? PAGE_SIZE_DEFAULT);

    return {
        filas,
        total,
        totalFiltrados,
        estados,
        regiones,
        pagina,
        pageSize,
        error: json?.error ? json.error : null,
    };
}

function buildQuery({ q, estado, region, orden, page, pageSize, facetas }) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (q) params.set("q", q);
    if (estado) params.set("estado", estado);
    if (region) params.set("region", region);
    if (orden) params.set("orden", orden);
    if (facetas) params.set("facetas", "1");
    return params.toString();
}

/**
 * Listado MP con filtros/paginación en servidor.
 * @param {string} modulo
 * @param {{ q?: string, estado?: string, region?: string, orden?: string, page?: number, pageSize?: number }} filtros
 */
export function useMercadoPublico(modulo, filtros = {}) {
    const {
        q = "",
        estado = "",
        region = "",
        orden = "",
        page = 1,
        pageSize = PAGE_SIZE_DEFAULT,
    } = filtros;

    const [state, setState] = useState({
        data: [],
        loading: true,
        refreshing: false,
        error: null,
        total: 0,
        totalFiltrados: 0,
        estados: [],
        regiones: [],
        pagina: 1,
        pageSize: PAGE_SIZE_DEFAULT,
    });

    const [qDebounced, setQDebounced] = useState(q);
    const abortRef = useRef(null);
    const facetasCargadas = useRef(false);
    const requestIdRef = useRef(0);

    useEffect(() => {
        const t = setTimeout(() => setQDebounced(q), DEBOUNCE_MS);
        return () => clearTimeout(t);
    }, [q]);

    // Reset facetas al cambiar de módulo
    useEffect(() => {
        facetasCargadas.current = false;
    }, [modulo]);

    const cargarDesdeDb = useCallback(async () => {
        if (!modulo) return;

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const requestId = ++requestIdRef.current;

        const pedirFacetas = !facetasCargadas.current;

        setState((prev) => ({
            ...prev,
            loading: prev.data.length === 0,
            refreshing: prev.data.length > 0,
            error: null,
        }));

        try {
            const qs = buildQuery({
                q: qDebounced,
                estado,
                region,
                orden,
                page,
                pageSize,
                facetas: pedirFacetas,
            });

            const res = await fetch(`/api/mercado-publico/${modulo}?${qs}`, {
                method: "GET",
                cache: "no-store",
                signal: controller.signal,
            });

            const json = await res.json();

            if (requestId !== requestIdRef.current) return;

            if (!res.ok) {
                setState((prev) => ({
                    ...prev,
                    data: [],
                    loading: false,
                    refreshing: false,
                    error: json?.error || "No se pudieron cargar los datos.",
                    total: 0,
                    totalFiltrados: 0,
                }));
                return;
            }

            const normalizado = normalizarRespuesta(json);
            if (pedirFacetas) facetasCargadas.current = true;

            setState((prev) => ({
                data: normalizado.filas,
                loading: false,
                refreshing: false,
                error: normalizado.error,
                total: normalizado.total,
                totalFiltrados: normalizado.totalFiltrados,
                estados: pedirFacetas
                    ? normalizado.estados
                    : fusionarSiVienen(prev.estados, normalizado.estados),
                regiones: pedirFacetas
                    ? normalizado.regiones
                    : fusionarSiVienen(prev.regiones, normalizado.regiones),
                pagina: normalizado.pagina,
                pageSize: normalizado.pageSize,
            }));
        } catch (error) {
            if (error?.name === "AbortError") return;
            if (requestId !== requestIdRef.current) return;

            setState((prev) => ({
                ...prev,
                data: [],
                loading: false,
                refreshing: false,
                error: error?.message || "Error inesperado al leer Supabase.",
                total: 0,
                totalFiltrados: 0,
            }));
        }
    }, [modulo, qDebounced, estado, region, orden, page, pageSize]);

    useEffect(() => {
        if (!modulo) return;
        cargarDesdeDb();
        return () => abortRef.current?.abort();
    }, [modulo, cargarDesdeDb]);

    return state;
}

function fusionarSiVienen(previos = [], nuevos = []) {
    if (!nuevos?.length) return previos;
    return [...new Set([...previos, ...nuevos])].sort((a, b) => a.localeCompare(b, "es"));
}
