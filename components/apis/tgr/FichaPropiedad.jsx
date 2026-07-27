import { useRouter } from "next/navigation";
import {
    ArrowLeft, Building2, Scale, Clock, AlertCircle,
    Download, Droplets, TrendingUp, Calendar, CheckCircle, XCircle, Map
} from "lucide-react";
import { formatCLP } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import dynamic from "next/dynamic";
import { obtenerCoordsFicha } from "@/lib/geoComunas";



const CARD = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" };
const SECTION_LABEL = { fontSize: "0.62rem", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", paddingLeft: "2px" };
const MapaPredio = dynamic(() => import("./MapaPredio"), { ssr: false, loading: () => (<p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Cargando mapa...</p>), });



const BG_SUCCESS = "color-mix(in srgb, var(--success) 12%, transparent)";
const BG_WARNING = "color-mix(in srgb, var(--warning) 12%, transparent)";
const BG_DANGER = "color-mix(in srgb, var(--danger)  12%, transparent)";
const BG_ACCENT = "color-mix(in srgb, var(--accent)  12%, transparent)";



function Campo({ label, valor, color }) {
    return (
        <div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "2px" }}>{label}</p>
            <p style={{ color: color ?? "var(--text-secondary)", fontWeight: 500, fontSize: "0.82rem", lineHeight: 1.3 }}>{valor && valor !== "" ? valor : "—"}</p>
        </div>
    );
}



function Tag({ children, tipo = "danger" }) {
    const estilos = {
        danger: { background: BG_DANGER, color: "var(--danger)", border: `1px solid var(--danger)` },
        warning: { background: BG_WARNING, color: "var(--warning)", border: `1px solid var(--warning)` },
        accent: { background: BG_ACCENT, color: "var(--accent)", border: `1px solid var(--accent)` },
        success: { background: BG_SUCCESS, color: "var(--success)", border: `1px solid var(--success)` },
    };
    const s = estilos[tipo] || estilos.danger;
    return (
        <span style={{ ...s, display: "inline-block", fontSize: "0.68rem", fontWeight: 500, padding: "2px 8px", borderRadius: "4px", fontFamily: "monospace" }}>
            {children}
        </span>
    );
}



function CardHeader({ icono: Icono, titulo, color }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingBottom: "12px", marginBottom: "12px", borderBottom: "1px solid var(--border)" }}>
            <Icono size={16} style={{ color }} />
            <span style={{ fontSize: "0.82rem", fontWeight: 500, color }}>{titulo}</span>
        </div>
    );
}



function CardDesc({ children }) {
    return <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "12px", lineHeight: 1.5 }}>{children}</p>;
}



function BarraScore({ score }) {
    const color = score >= 70 ? "var(--success)" : score >= 40 ? "var(--warning)" : "var(--danger)";
    return (
        <div style={{ marginBottom: "12px" }}>
            <div style={{ height: "6px", borderRadius: "999px", background: "var(--surface-2)", overflow: "hidden" }}>
                <div style={{ width: `${score}%`, height: "100%", borderRadius: "999px", background: color }} />
            </div>
        </div>
    );
}



export default function FichaPropiedad({ remate, analisis, errorAnalisis, rolFormato }) {
    const router = useRouter();
    const raw = remate._raw || {};



    const direccion = remate.direccionRol || raw.direccionRol || "Sin dirección";
    const comuna = remate.comunaJuzgado || raw.comunaJuzgado || "—";
    const dueno = remate.nombreDuegno || raw.nombreDuegno || "—";
    const tribunal = remate.tribunal || raw.nombreJuzgado || "—";
    const rolCausa = remate.rolCausa || raw.codDemanda || "—";
    const tipoDeuda = remate.tipoDeuda || "TERRITORIAL";
    const rolSII = remate.rolPropiedad || remate.rol || raw.rol || "—";
    const expediente = remate.expediente || raw.identificacionExpedienteAdm || "";
    const periodoDesde = remate.periodoDesde || raw.periodoPublicacionI || "—";
    const periodoHasta = remate.periodoHasta || raw.periodoPublicacionF || "—";
    const montoAvaluo = remate.montoAvaluo;
    const montoMinimo = remate.montoMinimo;
    const fechaRemate = remate.fechaRemate;



    const agua = analisis?.agua;
    const oportunidad = analisis?.oportunidad;
    const antiguedad = analisis?.antiguedad;


    const coordsMapa = obtenerCoordsFicha({
        analisis,
        comuna: remate?.comuna || remate?.comunaJuzgado || raw?.comunaJuzgado || raw?.comuna || "",
        direccion,
    });



    const nivelColor = { ALTO: "var(--success)", MEDIO: "var(--warning)", BAJO: "var(--danger)" };
    const nivelBg = {
        ALTO: { background: BG_SUCCESS, color: "var(--success)", border: `1px solid var(--success)` },
        MEDIO: { background: BG_WARNING, color: "var(--warning)", border: `1px solid var(--warning)` },
        BAJO: { background: BG_DANGER, color: "var(--danger)", border: `1px solid var(--danger)` },
    };



    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>



            {/* Top bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: "5px", border: "1px solid var(--border)", borderRadius: "8px", padding: "6px 12px", fontSize: "0.75rem", fontWeight: 500, color: "var(--text-secondary)", background: "var(--surface)", cursor: "pointer" }}>
                    <ArrowLeft size={13} /> Volver
                </button>
                <span style={{ fontSize: "0.68rem", padding: "3px 10px", borderRadius: "999px", border: "1px solid var(--border)", color: "var(--text-muted)", fontFamily: "monospace" }}>
                    {expediente || rolFormato}
                </span>
                <span style={{ fontSize: "0.68rem", padding: "3px 10px", borderRadius: "999px", border: `1px solid var(--success)`, color: "var(--success)", background: BG_SUCCESS, display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
                    Remate activo
                </span>
            </div>



            {/* Hero */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px 24px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: "var(--success)", borderRadius: "16px 0 0 16px" }} />
                <h1 style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--success)", margin: "0 0 4px", textTransform: "uppercase", lineHeight: 1.2 }}>{direccion}</h1>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>{comuna} · Inmueble territorial</p>
            </div>



            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
                    <p style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Valor de referencia</p>
                    <p style={{ fontSize: "1rem", fontWeight: 500, fontFamily: "monospace", color: "var(--text-secondary)", lineHeight: 1 }}>{montoAvaluo ? formatCLP(montoAvaluo) : "—"}</p>
                </div>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
                    <p style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>▲ Tasación mínima</p>
                    <p style={{ fontSize: "1rem", fontWeight: 500, fontFamily: "monospace", color: "var(--success)", lineHeight: 1 }}>{montoMinimo ? formatCLP(montoMinimo) : "—"}</p>
                </div>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
                    <p style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Fecha del remate</p>
                    <p style={{ fontSize: "1rem", fontWeight: 500, fontFamily: "monospace", color: "var(--accent)", lineHeight: 1 }}>{fechaRemate ? formatDate(fechaRemate) : "—"}</p>
                    <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "3px" }}>13:00 hrs.</p>
                </div>
            </div>



            {/* Info del predio-Layout 2/3 + 1/3 */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", alignItems: "start" }}>



                {/* Columna izquierda — info del predio */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <p style={SECTION_LABEL}>Información del predio</p>



                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
                        <CardHeader icono={Building2} titulo="Identificación del activo" color="var(--accent)" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
                            <div style={{ gridColumn: "1 / -1" }}><Campo label="Deudor / Propietario" valor={dueno} /></div>
                            <Campo label="Comuna" valor={comuna} />
                            <Campo label="ROL · SII" valor={rolSII} color="var(--accent)" />
                        </div>
                    </div>



                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
                        <CardHeader icono={Scale} titulo="Antecedentes judiciales" color="var(--warning)" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
                            <div style={{ gridColumn: "1 / -1" }}><Campo label="Juzgado" valor={tribunal} /></div>
                            <Campo label="ROL Judicial" valor={String(rolCausa)} />
                            <div>
                                <p style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Tipo de deuda</p>
                                <Tag tipo="danger">{tipoDeuda}</Tag>
                            </div>
                        </div>
                    </div>



                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
                        <CardHeader icono={Clock} titulo="Períodos del impuesto adeudado" color="var(--text-secondary)" />
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                            <Campo label="Desde" valor={periodoDesde} />
                            <Campo label="Hasta" valor={periodoHasta} />
                            <Campo label="Extensión" valor="—" />
                        </div>
                    </div>
                    {/* Mapa */}
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px", minHeight: "200px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <CardHeader icono={Map} titulo="Ubicación del predio" color="var(--accent)" />
                        <MapaPredio
                            rol={rolSII}
                            direccion={direccion}
                            comuna={remate?.comuna || remate?.comunaJuzgado || raw?.comunaJuzgado || raw?.comuna || ""}
                            fallbackLat={coordsMapa?.lat}
                            fallbackLng={coordsMapa?.lng}
                        />
                    </div>
                </div>



                {/* Columna derecha — análisis */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <p style={SECTION_LABEL}>Análisis</p>



                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
                        <CardHeader icono={TrendingUp} titulo="Oportunidad de compra" color="var(--warning)" />
                        <CardDesc>Compara la tasación mínima con el avalúo fiscal para detectar propiedades subvaluadas.</CardDesc>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <Campo label="Descuento" valor={oportunidad ? `${oportunidad.descuento}%` : "—"} color={oportunidad?.nivel === "ALTA" ? "var(--success)" : "var(--text-muted)"} />
                            <div>
                                <p style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Nivel</p>
                                {oportunidad
                                    ? <Tag tipo={oportunidad.nivel === "ALTA" ? "success" : oportunidad.nivel === "MEDIA" ? "warning" : "accent"}>{oportunidad.nivel}</Tag>
                                    : <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>—</span>
                                }
                            </div>
                        </div>
                    </div>



                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
                        <CardHeader icono={Calendar} titulo="Antigüedad de deuda" color="var(--accent)" />
                        <CardDesc>Deudas más antiguas pueden indicar propiedades abandonadas o con problemas de título.</CardDesc>
                        {antiguedad ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <Campo label="Antigüedad" valor={`${antiguedad.anios} años`} color="var(--accent)" />
                                <Campo label="Meses totales" valor={String(antiguedad.meses)} />
                                <div>
                                    <p style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Nivel</p>
                                    <Tag tipo="accent">{antiguedad.nivel}</Tag>
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Sin datos de período de deuda.</p>
                        )}
                    </div>



                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Droplets size={16} style={{ color: "var(--accent)" }} />
                                <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--accent)" }}>Agua subterránea</span>
                            </div>
                            {agua && (
                                <span style={{ ...nivelBg[agua.nivel], fontSize: "0.68rem", fontWeight: 500, padding: "3px 10px", borderRadius: "999px", fontFamily: "monospace" }}>
                                    {agua.nivel}
                                </span>
                            )}
                        </div>



                        <CardDesc>Estima la probabilidad de encontrar agua subterránea apta para perforar un pozo, usando datos de la DGA, topografía y uso de suelo.</CardDesc>



                        {errorAnalisis ? (
                            <p style={{ color: "var(--danger)", fontSize: "0.8rem" }}>⚠ {errorAnalisis}</p>
                        ) : agua ? (
                            <>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", padding: "8px 10px", borderRadius: "8px", marginBottom: "12px", background: agua.puedePerforar ? BG_SUCCESS : BG_DANGER, color: agua.puedePerforar ? "var(--success)" : "var(--danger)" }}>
                                    {agua.puedePerforar ? <CheckCircle size={13} /> : <XCircle size={13} />}
                                    <span>{agua.puedePerforar ? "No está en zona de prohibición DGA" : "Zona de prohibición DGA"}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "2.25rem", fontWeight: 500, fontFamily: "monospace", color: nivelColor[agua.nivel], lineHeight: 1 }}>{agua.score}</span>
                                    <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontFamily: "monospace" }}>/ 100</span>
                                </div>
                                <BarraScore score={agua.score} />
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                                    <div>
                                        <p style={{ fontSize: "0.9rem", fontWeight: 500, fontFamily: "monospace", color: "var(--text-secondary)" }}>{String(agua.pozos2km)}</p>
                                        <p style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "2px" }}>Pozos 2km</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: "0.9rem", fontWeight: 500, fontFamily: "monospace", color: "var(--text-secondary)" }}>{agua.caudalPromedio ? `${agua.caudalPromedio} l/s` : "—"}</p>
                                        <p style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "2px" }}>Caudal</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: "0.9rem", fontWeight: 500, fontFamily: "monospace", color: "var(--text-secondary)" }}>{agua.posicion}</p>
                                        <p style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "2px" }}>Topografía</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: "0.9rem", fontWeight: 500, fontFamily: "monospace", color: "var(--text-secondary)" }}>{`${agua.pendiente}%`}</p>
                                        <p style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "2px" }}>Pendiente</p>
                                    </div>
                                </div>
                                {agua.errorDGA && (
                                    <div style={{ background: BG_WARNING, border: `1px solid var(--warning)`, borderRadius: "8px", padding: "8px 12px", fontSize: "0.72rem", color: "var(--warning)", display: "flex", gap: "6px", alignItems: "center" }}>
                                        <AlertCircle size={13} style={{ flexShrink: 0 }} />
                                        <span>{agua.errorDGA}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Cargando análisis...</p>
                        )}
                    </div>
                </div>
            </div>




            {/* Advertencia subasta */}
            <div style={{ background: BG_WARNING, border: `1px solid var(--warning)`, borderRadius: "12px", padding: "12px 16px", fontSize: "0.75rem", color: "var(--warning)", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "1px" }} />
                <span><strong>Condiciones de subasta no publicadas.</strong> Garantía, modalidad y bases se detallan en el edicto judicial.</span>
            </div>



            {/* Footer */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "monospace" }}>⊙ Fuente: TGR · actualizado hoy</p>
                <button
                    onClick={() => window.open("https://remates.tgr.cl/", "_blank")}
                    style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid var(--border)", borderRadius: "8px", padding: "6px 14px", fontSize: "0.75rem", fontWeight: 500, color: "var(--text-secondary)", background: "var(--surface)", cursor: "pointer" }}
                >
                    <Download size={13} /> Descargar edicto
                </button>
            </div>



        </div>
    );
}