"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import ThemeToggleBtn from "@/components/layout/ThemeToggleBtn";

export default function ResetClient() {
    const [cargando, setCargando] = useState(true);
    const [haySesion, setHaySesion] = useState(false);
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [verClave, setVerClave] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [ok, setOk] = useState(false);

    useEffect(() => {
        const supabase = createSupabaseBrowserClient();
        supabase.auth.getUser().then(({ data }) => {
            setHaySesion(Boolean(data.user));
            setCargando(false);
        });
    }, []);

    async function guardar(e) {
        e.preventDefault();
        setError("");
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (password !== password2) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        setLoading(true);
        const supabase = createSupabaseBrowserClient();
        const { error: err } = await supabase.auth.updateUser({ password });
        if (err) {
            setError("No se pudo actualizar la contraseña. Solicita un nuevo enlace.");
            setLoading(false);
            return;
        }
        setOk(true);
        setTimeout(() => window.location.assign("/dashboard/tgr"), 1400);
    }

    const card = {
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: "24rem",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "1rem",
        padding: "2rem 1.75rem",
        boxShadow: "0 24px 60px -20px rgba(0,0,0,0.6)",
    };
    const inputWrap = { display: "flex", alignItems: "center", gap: "0.55rem", padding: "0 0.75rem", borderRadius: "0.65rem", border: "1px solid var(--border)", background: "var(--surface-2)" };
    const inputStyle = { flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", padding: "0.72rem 0", color: "var(--text-secondary)", fontSize: "0.88rem", fontFamily: "inherit" };

    return (
        <div style={{ position: "relative", minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", background: "var(--bg)", overflow: "hidden" }}>
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(60rem 40rem at 50% -10%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 60%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "1.25rem", right: "1.25rem", zIndex: 2 }}>
                <ThemeToggleBtn />
            </div>

            <div style={card}>
                <div style={{ textAlign: "center", marginBottom: "1.4rem" }}>
                    <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "1.35rem", lineHeight: 1.1 }}>
                        <span style={{ color: "var(--text-secondary)" }}>Estado</span>
                        <span style={{ color: "var(--accent)" }}>HUB</span>
                    </div>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Define tu nueva contraseña</p>
                </div>

                {cargando ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "var(--text-muted)", padding: "1rem 0", fontSize: "0.85rem" }}>
                        <Loader2 size={16} className="animate-spin" /> Verificando enlace…
                    </div>
                ) : ok ? (
                    <div role="status" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 0.8rem", borderRadius: "0.6rem", border: "1px solid color-mix(in srgb, var(--success) 45%, var(--border))", background: "color-mix(in srgb, var(--success) 12%, var(--surface-2))", color: "var(--success)", fontSize: "0.82rem" }}>
                        <CheckCircle2 size={16} /> Contraseña actualizada. Entrando…
                    </div>
                ) : !haySesion ? (
                    <div>
                        <div role="alert" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 0.8rem", borderRadius: "0.6rem", border: "1px solid color-mix(in srgb, var(--danger) 45%, var(--border))", background: "color-mix(in srgb, var(--danger) 12%, var(--surface-2))", color: "var(--danger)", fontSize: "0.8rem", marginBottom: "1rem" }}>
                            <AlertCircle size={16} /> El enlace no es válido o ya expiró.
                        </div>
                        <a href="/login" style={{ display: "block", textAlign: "center", color: "var(--accent)", fontSize: "0.82rem", textDecoration: "none", fontWeight: 600 }}>
                            Volver a iniciar sesión
                        </a>
                    </div>
                ) : (
                    <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                        {error && (
                            <div role="alert" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 0.75rem", borderRadius: "0.6rem", border: "1px solid color-mix(in srgb, var(--danger) 45%, var(--border))", background: "color-mix(in srgb, var(--danger) 12%, var(--surface-2))", color: "var(--danger)", fontSize: "0.78rem" }}>
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}
                        <div style={inputWrap}>
                            <Lock size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                            <input type={verClave ? "text" : "password"} autoComplete="new-password" required minLength={6} placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
                            <button type="button" onClick={() => setVerClave((v) => !v)} aria-label={verClave ? "Ocultar" : "Mostrar"} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: "0.25rem" }}>
                                {verClave ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <div style={inputWrap}>
                            <Lock size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                            <input type={verClave ? "text" : "password"} autoComplete="new-password" required minLength={6} placeholder="Repite la contraseña" value={password2} onChange={(e) => setPassword2(e.target.value)} style={inputStyle} />
                        </div>
                        <button type="submit" disabled={loading} style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.8rem 1rem", marginTop: "0.15rem", borderRadius: "0.7rem", border: "1px solid color-mix(in srgb, var(--accent) 60%, var(--border))", background: "color-mix(in srgb, var(--accent) 22%, var(--surface-2))", color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? "Guardando…" : "Guardar contraseña"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
