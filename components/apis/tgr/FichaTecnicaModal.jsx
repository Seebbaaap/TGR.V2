"use client";

import { X, Calendar, Building2, Scale, Clock, AlertCircle, Download } from "lucide-react";
import { formatCLP } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

function Campo({ label, valor, accentColor }) {
    return (
        <div className="min-w-0">
            <p
                style={{
                    color: "var(--text-muted)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "2px",
                }}
            >
                {label}
            </p>
            <p
                className="break-words"
                style={{
                    color: accentColor ?? "var(--text-secondary)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                }}
            >
                {valor && valor !== "" ? valor : "—"}
            </p>
        </div>
    );
}

function valorTexto(...vals) {
    for (const v of vals) {
        if (v !== null && v !== undefined && v !== "") return v;
    }
    return null;
}

function valorNumero(...vals) {
    for (const v of vals) {
        if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;

        if (typeof v === "string" && v.trim() !== "") {
            const limpio = v
                .replace(/\$/g, "")
                .replace(/\s/g, "")
                .replace(/\./g, "")
                .replace(/,/g, ".")
                .replace(/[^\d.-]/g, "");

            const n = Number(limpio);
            if (!Number.isNaN(n) && n > 0) return n;
        }
    }
    return null;
}

function deepGet(obj, path) {
    try {
        return path.split(".").reduce((acc, key) => acc?.[key], obj);
    } catch {
        return undefined;
    }
}

function buscarNumeroEnObjeto(obj, claves) {
    if (!obj || typeof obj !== "object") return null;

    for (const clave of claves) {
        const directo = obj[clave];
        const n1 = valorNumero(directo);
        if (n1) return n1;
    }

    for (const clave of claves) {
        const anidado = deepGet(obj, clave);
        const n2 = valorNumero(anidado);
        if (n2) return n2;
    }

    return null;
}

function resolverMontoMinimo(remate, raw) {
    const clavesMinimo = [
        "montoMinimo",
        "tasacionMinima",
        "posturaMinima",
        "valorMinimo",
        "minimoSubasta",
        "precioMinimo",
        "baseRemate",
        "base_minima",
        "postura_minima",
        "minimo_remate",
        "monto_minimo",
        "tasacion_minima",
        "valor_minimo",
        "base",
        "minimo",
        "subastaMinima",
        "detalle.montoMinimo",
        "detalle.tasacionMinima",
        "detalle.posturaMinima",
        "remate.montoMinimo",
        "remate.tasacionMinima",
        "remate.posturaMinima",
        "data.montoMinimo",
        "data.tasacionMinima",
        "data.posturaMinima",
    ];

    const candidato1 = buscarNumeroEnObjeto(remate, clavesMinimo);
    if (candidato1) return candidato1;

    const candidato2 = buscarNumeroEnObjeto(raw, clavesMinimo);
    if (candidato2) return candidato2;

    return null;
}

function resolverRolCausa(remate, raw) {
    const claves = [
        "rolCausa",
        "rolJuicio",
        "rolJudicial",
        "rol_judicial",
        "numeroCausa",
        "causa",
        "rit",
        "rolExpediente",
        "expedienteCausa",
        "detalle.rolCausa",
        "remate.rolCausa",
        "data.rolCausa",
    ];

    for (const k of claves) {
        const v1 = valorTexto(remate?.[k]);
        if (v1) return v1;
        const v2 = valorTexto(raw?.[k]);
        if (v2) return v2;
        const v3 = valorTexto(deepGet(remate, k));
        if (v3) return v3;
        const v4 = valorTexto(deepGet(raw, k));
        if (v4) return v4;
    }

    return "—";
}

function resolverPeriodo(remate, raw, tipo) {
    const clavesDesde = [
        "periodoDesde",
        "desdePeriodo",
        "periodoInicial",
        "inicioPeriodo",
        "periodo_inicio",
        "periodoDeudaDesde",
        "periodoMin",
        "desde",
        "detalle.periodoDesde",
        "data.periodoDesde",
    ];

    const clavesHasta = [
        "periodoHasta",
        "hastaPeriodo",
        "periodoFinal",
        "finPeriodo",
        "periodo_fin",
        "periodoDeudaHasta",
        "periodoMax",
        "hasta",
        "detalle.periodoHasta",
        "data.periodoHasta",
    ];

    const claves = tipo === "desde" ? clavesDesde : clavesHasta;

    for (const k of claves) {
        const v1 = valorTexto(remate?.[k]);
        if (v1) return v1;
        const v2 = valorTexto(raw?.[k]);
        if (v2) return v2;
        const v3 = valorTexto(deepGet(remate, k));
        if (v3) return v3;
        const v4 = valorTexto(deepGet(raw, k));
        if (v4) return v4;
    }

    return "—";
}

export default function FichaTecnicaModal({ remate, onClose }) {
    if (!remate) return null;

    const raw = remate._raw ?? {};

    const direccion = valorTexto(
        remate.direccionRol,
        raw.direccionRol,
        raw.direccion,
        raw.ubicacion,
        "Sin dirección"
    );

    const comuna = valorTexto(
        remate.comunaJuzgado,
        raw.comunaJuzgado,
        raw.comuna,
        raw.comunaBien,
        "—"
    );

    const nombreDueno = valorTexto(
        remate.nombreDuegno,
        raw.nombreDuegno,
        raw.nombreDueno,
        raw.deudor,
        raw.propietario,
        "—"
    );

    const rolPropiedad = valorTexto(
        remate.rolPropiedad,
        remate.rol,
        raw.rolPropiedad,
        raw.rolPropiedadSii,
        raw.rolSii,
        raw.rol,
        "—"
    );

    const rolCausa = resolverRolCausa(remate, raw);

    const expediente = valorTexto(
        remate.expediente,
        raw.expediente,
        raw.numeroExpediente,
        raw.codigoExpediente,
        raw.expedienteRemate,
        rolCausa !== "—" && comuna ? `Exp. ${rolCausa}-${new Date().getFullYear()}-${comuna}` : null
    );

    const tribunal = valorTexto(
        remate.tribunal,
        raw.tribunal,
        raw.juzgado,
        raw.nombreJuzgado,
        raw.juzgadoLetras,
        "Sin datos"
    );

    const dirTribunal = valorTexto(
        remate.direccionTribunal,
        raw.direccionTribunal,
        raw.domicilioJuzgado,
        raw.direccionJuzgado,
        raw.ubicacionJuzgado,
        "Sin datos"
    );

    const tipoDeuda = valorTexto(
        remate.tipoDeuda,
        raw.tipoDeuda,
        raw.tipo,
        raw.tipoCobro,
        "TERRITORIAL"
    );

    const montoAvaluo = valorNumero(
        remate.montoAvaluo,
        raw.montoAvaluo,
        raw.avaluoFiscal,
        raw.valorReferencia,
        raw.avaluo,
        raw.valorAvaluo
    );

    const montoMinimo = resolverMontoMinimo(remate, raw);

    const fechaRemate = valorTexto(
        remate.fechaRemate,
        raw.fechaRemate,
        raw.fecha,
        raw.fechaSubasta,
        raw.fechaAudiencia
    );

    const horaRemate = valorTexto(
        remate.horaRemate,
        raw.horaRemate,
        raw.hora,
        raw.horaSubasta,
        "13:00"
    );

    const periodoDesde = resolverPeriodo(remate, raw, "desde");
    const periodoHasta = resolverPeriodo(remate, raw, "hasta");

    const extension = valorTexto(
        remate.extension,
        raw.extension,
        raw.tramo,
        raw.superficie,
        raw.detalleExtension,
        "—"
    );

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.72)",
                    backdropFilter: "blur(5px)",
                    zIndex: 50,
                }}
            />

            <div
                className="fixed left-1/2 top-1/2 z-[51] flex w-[min(760px,95vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[18px]"
                style={{
                    maxHeight: "92dvh",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
                }}
            >
                <div
                    className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-5"
                    style={{
                        borderBottom: "1px solid var(--border)",
                        background: "var(--surface-2)",
                    }}
                >
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                        <p
                            style={{
                                color: "var(--text-muted)",
                                fontSize: "0.7rem",
                                fontFamily: "monospace",
                                letterSpacing: "0.05em",
                            }}
                        >
                            FICHA TÉCNICA DEL REMATE
                        </p>

                        {expediente && (
                            <span
                                className="max-w-full truncate"
                                style={{
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)",
                                    color: "var(--text-secondary)",
                                    padding: "2px 10px",
                                    borderRadius: "6px",
                                    fontSize: "0.7rem",
                                    fontFamily: "monospace",
                                }}
                                title={expediente}
                            >
                                {expediente}
                            </span>
                        )}

                        <span
                            style={{
                                background: "color-mix(in srgb, var(--success) 15%, transparent)",
                                border: "1px solid var(--success)",
                                color: "var(--success)",
                                padding: "2px 10px",
                                borderRadius: "999px",
                                fontSize: "0.7rem",
                                fontFamily: "monospace",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                            }}
                        >
                            <span
                                style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background: "var(--success)",
                                    display: "inline-block",
                                }}
                            />
                            Remate activo
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="shrink-0"
                        style={{
                            color: "var(--text-muted)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div className="min-w-0">
                        <h2
                            className="text-base font-extrabold uppercase leading-snug break-words sm:text-2xl lg:text-3xl"
                            style={{ color: "var(--success)" }}
                        >
                            {direccion}
                        </h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "4px" }}>
                            {comuna} · Inmueble territorial
                        </p>
                    </div>

                    <div
                        className="modal-grid-3 overflow-hidden rounded-xl"
                        style={{ border: "1px solid var(--border)" }}
                    >
                        <div className="border-b border-[var(--border)] p-4 sm:border-b-0 sm:border-r">
                            <p style={{ color: "var(--text-muted)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                                Valor de referencia
                            </p>
                            <p className="break-all font-mono text-base font-bold sm:text-[1.05rem]" style={{ color: "var(--text-secondary)" }}>
                                {montoAvaluo ? formatCLP(montoAvaluo) : "—"}
                            </p>
                        </div>

                        <div className="border-b border-[var(--border)] p-4 sm:border-b-0 sm:border-r">
                            <p style={{ color: "var(--text-muted)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                                ▲ Tasación mínima
                            </p>
                            <p className="break-all font-mono text-base font-bold sm:text-[1.05rem]" style={{ color: "var(--success)" }}>
                                {montoMinimo ? formatCLP(montoMinimo) : "—"}
                            </p>
                        </div>

                        <div className="p-4">
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                                <Calendar size={11} style={{ color: "var(--accent)" }} />
                                <p style={{ color: "var(--text-muted)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                    Fecha del remate
                                </p>
                            </div>
                            <p className="font-mono text-base font-extrabold sm:text-[1.05rem]" style={{ color: "var(--accent)" }}>
                                {fechaRemate ? formatDate(fechaRemate) : "—"}
                            </p>
                            <p style={{ color: "var(--accent)", fontSize: "0.85rem", fontWeight: 600 }}>
                                {horaRemate} hrs.
                            </p>
                        </div>
                    </div>

                    <div className="modal-grid-2">
                        <div
                            style={{
                                background: "var(--surface-2)",
                                border: "1px solid var(--border)",
                                borderRadius: "12px",
                                padding: "1rem",
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.75rem",
                                minWidth: 0,
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                                <Building2 size={13} style={{ color: "var(--accent)" }} />
                                <p style={{ color: "var(--accent)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                    Identificación del activo
                                </p>
                            </div>

                            <Campo label="Deudor / Propietario" valor={nombreDueno} />
                            <Campo label="Ubicación del inmueble" valor={direccion} />
                            <Campo label="Comuna / Sector" valor={comuna} />
                            <Campo label="ROL Propiedad · SII" valor={rolPropiedad} accentColor="var(--accent)" />
                        </div>

                        <div
                            style={{
                                background: "var(--surface-2)",
                                border: "1px solid var(--border)",
                                borderRadius: "12px",
                                padding: "1rem",
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.75rem",
                                minWidth: 0,
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                                <Scale size={13} style={{ color: "var(--warning)" }} />
                                <p style={{ color: "var(--warning)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                    Antecedentes judiciales
                                </p>
                            </div>

                            <Campo label="Juzgado" valor={tribunal} />
                            <Campo label="Dirección del juzgado" valor={dirTribunal} />
                            <Campo label="ROL Judicial · Causa" valor={rolCausa} />

                            <div>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                                    Tipo de deuda
                                </p>
                                <span
                                    style={{
                                        background: "color-mix(in srgb, var(--danger) 15%, transparent)",
                                        color: "var(--danger)",
                                        border: "1px solid var(--danger)",
                                        padding: "2px 10px",
                                        borderRadius: "4px",
                                        fontSize: "0.7rem",
                                        fontFamily: "monospace",
                                        fontWeight: 700,
                                        letterSpacing: "0.06em",
                                    }}
                                >
                                    {tipoDeuda}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            background: "var(--surface-2)",
                            border: "1px solid var(--border)",
                            borderRadius: "12px",
                            padding: "1rem",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.8rem" }}>
                            <Clock size={13} style={{ color: "var(--text-muted)" }} />
                            <p style={{ color: "var(--text-muted)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                Períodos del impuesto adeudado
                            </p>
                        </div>

                        <div className="modal-grid-3">
                            <Campo label="Desde" valor={periodoDesde} />
                            <Campo label="Hasta" valor={periodoHasta} />
                            <Campo label="Extensión" valor={extension} />
                        </div>
                    </div>

                    <div
                        style={{
                            background: "color-mix(in srgb, var(--warning) 10%, transparent)",
                            border: "1px solid color-mix(in srgb, var(--warning) 40%, transparent)",
                            borderRadius: "10px",
                            padding: "0.9rem 1rem",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "10px",
                        }}
                    >
                        <AlertCircle size={16} style={{ color: "var(--warning)", flexShrink: 0, marginTop: "1px" }} />
                        <p style={{ color: "var(--warning)", fontSize: "0.8rem", lineHeight: 1.5 }}>
                            <strong>Condiciones de subasta no publicadas.</strong>{" "}
                            <span style={{ color: "var(--text-secondary)" }}>
                                Garantía, modalidad y bases se detallan en el edicto judicial. Descárgalo para conocer los requisitos de participación.
                            </span>
                        </p>
                    </div>
                </div>

                <div
                    className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"
                    style={{
                        borderTop: "1px solid var(--border)",
                        background: "var(--surface-2)",
                    }}
                >
                    <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontFamily: "monospace" }}>
                        ⊙ Fuente: TGR · actualizado hoy
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <a
                            href="https://remates.tgr.cl/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                                color: "var(--text-secondary)",
                                padding: "0.5rem 1rem",
                                borderRadius: "8px",
                                fontSize: "0.8rem",
                                fontFamily: "monospace",
                                textDecoration: "none",
                            }}
                        >
                            <Download size={13} />
                            Descargar edicto
                        </a>

                        <button
                            onClick={onClose}
                            style={{
                                background: "var(--accent)",
                                color: "#0a0a0f",
                                border: "none",
                                padding: "0.5rem 1.25rem",
                                borderRadius: "8px",
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                fontFamily: "monospace",
                                cursor: "pointer",
                            }}
                        >
                            Cerrar ficha
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}