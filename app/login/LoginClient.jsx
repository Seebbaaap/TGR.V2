"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import ThemeToggleBtn from "@/components/layout/ThemeToggleBtn";

const MENSAJES_ERROR = {
    auth: "No pudimos validar tu cuenta. Intenta nuevamente.",
    sin_codigo: "La sesión no se completó. Vuelve a intentarlo.",
    denegado: "Cancelaste el ingreso con Google.",
    enlace_invalido: "El enlace no es válido o ya expiró. Solicítalo de nuevo.",
};

function traducirError(msg = "") {
    const m = msg.toLowerCase();
    if (m.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
    if (m.includes("email not confirmed")) return "Debes confirmar tu correo antes de entrar. Revisa tu bandeja.";
    if (m.includes("user already registered")) return "Ese correo ya está registrado. Inicia sesión.";
    if (m.includes("password should be at least")) return "La contraseña debe tener al menos 6 caracteres.";
    if (m.includes("unable to validate email")) return "El correo no tiene un formato válido.";
    if (m.includes("rate limit") || m.includes("too many")) return "Demasiados intentos. Espera un momento.";
    return msg || "Ocurrió un error. Intenta nuevamente.";
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.62Z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18Z" />
            <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34Z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58Z" />
        </svg>
    );
}

const inputWrap = {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    padding: "0 0.75rem",
    borderRadius: "0.65rem",
    border: "1px solid var(--border)",
    background: "var(--surface-2)",
};
const inputStyle = {
    flex: 1,
    minWidth: 0,
    background: "transparent",
    border: "none",
    outline: "none",
    padding: "0.72rem 0",
    color: "var(--text-secondary)",
    fontSize: "0.88rem",
    fontFamily: "inherit",
};

export default function LoginClient() {
    // modo: "login" | "registro" | "recuperar"
    const [modo, setModo] = useState("login");
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [verClave, setVerClave] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [aviso, setAviso] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const err = params.get("error");
        if (err) setError(MENSAJES_ERROR[err] || "Ocurrió un error al ingresar.");
    }, []);

    function cambiarModo(nuevo) {
        setModo(nuevo);
        setError("");
        setAviso("");
        setPassword2("");
    }

    function siguienteRuta() {
        const next = new URLSearchParams(window.location.search).get("next") || "";
        // Solo rutas internas: evita redirecciones abiertas a sitios externos.
        return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard/tgr";
    }

    async function ingresarConGoogle() {
        setError("");
        setAviso("");
        setLoading(true);
        try {
            const supabase = createSupabaseBrowserClient();
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(siguienteRuta())}`,
                },
            });
            if (oauthError) {
                setError("No se pudo iniciar sesión con Google.");
                setLoading(false);
            }
        } catch {
            setError("No se pudo iniciar sesión con Google.");
            setLoading(false);
        }
    }

    // Registra/actualiza al usuario en la tabla `usuarios` (RLS: auth.uid() = id).
    async function registrarActividad(supabase, user) {
        if (!user) return;
        await supabase.from("usuarios").upsert(
            {
                id: user.id,
                email: user.email,
                nombre: user.user_metadata?.full_name || user.user_metadata?.name || null,
                avatar_url: user.user_metadata?.avatar_url || null,
                proveedor: user.app_metadata?.provider || "email",
                ultimo_acceso: new Date().toISOString(),
            },
            { onConflict: "id" }
        );
    }

    async function enviar(e) {
        e.preventDefault();
        setError("");
        setAviso("");
        setLoading(true);
        const supabase = createSupabaseBrowserClient();
        const origin = window.location.origin;

        try {
            if (modo === "recuperar") {
                const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                    redirectTo: `${origin}/auth/confirm?type=recovery&next=/auth/reset`,
                });
                if (err) { setError(traducirError(err.message)); setLoading(false); return; }
                setAviso("Te enviamos un correo con un enlace para restablecer tu contraseña.");
                setLoading(false);
                return;
            }

            if (modo === "registro") {
                if (!nombre.trim()) { setError("Escribe tu nombre."); setLoading(false); return; }
                if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); setLoading(false); return; }
                if (password !== password2) { setError("Las contraseñas no coinciden."); setLoading(false); return; }

                const { data, error: err } = await supabase.auth.signUp({
                    email: email.trim(),
                    password,
                    options: {
                        data: { full_name: nombre.trim() },
                        emailRedirectTo: `${origin}/auth/confirm?type=signup`,
                    },
                });
                if (err) { setError(traducirError(err.message)); setLoading(false); return; }

                // Si la confirmación por correo está desactivada, ya hay sesión → entra directo.
                if (data.session && data.user) {
                    await registrarActividad(supabase, data.user);
                    window.location.assign(siguienteRuta());
                    return;
                }
                setAviso("¡Cuenta creada! Te enviamos un correo para confirmarla. Revisa tu bandeja.");
                setLoading(false);
                return;
            }

            // modo === "login"
            const { data, error: err } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });
            if (err) { setError(traducirError(err.message)); setLoading(false); return; }
            await registrarActividad(supabase, data.user);
            window.location.assign(siguienteRuta());
        } catch {
            setError("Ocurrió un error. Intenta nuevamente.");
            setLoading(false);
        }
    }

    const titulo =
        modo === "registro" ? "Crea tu cuenta" : modo === "recuperar" ? "Recupera tu acceso" : "inicia sesión para continuar";
    const textoBoton =
        modo === "registro" ? "Crear cuenta" : modo === "recuperar" ? "Enviar enlace" : "Ingresar";

    return (
        <div
            style={{
                position: "relative",
                minHeight: "100dvh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1.5rem",
                background: "var(--bg)",
                overflow: "hidden",
            }}
        >
            {/* Resplandor y grilla de fondo */}
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "radial-gradient(60rem 40rem at 50% -10%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 60%), radial-gradient(40rem 30rem at 90% 110%, color-mix(in srgb, var(--text) 10%, transparent), transparent 60%)",
                    pointerEvents: "none",
                }}
            />
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                        "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                    opacity: 0.15,
                    maskImage: "radial-gradient(circle at 50% 40%, black, transparent 75%)",
                    WebkitMaskImage: "radial-gradient(circle at 50% 40%, black, transparent 75%)",
                    pointerEvents: "none",
                }}
            />

            <div style={{ position: "absolute", top: "1.25rem", right: "1.25rem", zIndex: 2 }}>
                <ThemeToggleBtn />
            </div>

            {/* Tarjeta */}
            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    width: "100%",
                    maxWidth: "26rem",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "1rem",
                    padding: "2rem 1.75rem",
                    boxShadow:
                        "0 24px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px color-mix(in srgb, var(--accent) 8%, transparent)",
                }}
            >
                {/* Logo */}
                <div style={{ width: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)", lineHeight: 0, marginBottom: "1.15rem" }}>
                    <Image src="/logo-hublab.jpg" alt="HubLab logo" width={420} height={150} priority style={{ width: "100%", height: "auto", objectFit: "contain", display: "block" }} />
                </div>

                {/* Marca */}
                <div style={{ textAlign: "center", marginBottom: "0.35rem" }}>
                    <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "1.5rem", lineHeight: 1.1 }}>
                        <span style={{ color: "var(--text-secondary)" }}>Estado</span>
                        <span style={{ color: "var(--accent)" }}>HUB</span>
                    </div>
                    <p style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.14em", marginTop: "5px" }}>
                        APIs Públicas del Estado
                    </p>
                </div>

                {/* Subtítulo / modo */}
                <p key={`titulo-${modo}`} className="auth-animate" style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--text)", textAlign: "center", margin: "1.1rem 0 1.3rem", opacity: 0.9 }}>
                    <span style={{ color: "var(--text-muted)" }}>&gt;</span> {titulo}
                </p>

                {/* Avisos */}
                {error && (
                    <div role="alert" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 0.75rem", marginBottom: "1rem", borderRadius: "0.6rem", border: "1px solid color-mix(in srgb, var(--danger) 45%, var(--border))", background: "color-mix(in srgb, var(--danger) 12%, var(--surface-2))", color: "var(--danger)", fontSize: "0.78rem" }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}
                {aviso && (
                    <div role="status" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 0.75rem", marginBottom: "1rem", borderRadius: "0.6rem", border: "1px solid color-mix(in srgb, var(--success) 45%, var(--border))", background: "color-mix(in srgb, var(--success) 12%, var(--surface-2))", color: "var(--success)", fontSize: "0.78rem" }}>
                        <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                        <span>{aviso}</span>
                    </div>
                )}

                {/* Botón de Google */}
                <button
                    type="button"
                    onClick={ingresarConGoogle}
                    disabled={loading}
                    className="auth-btn"
                    style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", padding: "0.8rem 1rem", borderRadius: "0.7rem", border: "1px solid var(--border)", background: "#ffffff", color: "#1f1f1f", fontSize: "0.9rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: "0 1px 2px rgba(0,0,0,0.25)" }}
                >
                    <GoogleIcon />
                    Continuar con Google
                </button>

                {/* Separador */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.15rem 0" }}>
                    <span style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>o con tu correo</span>
                    <span style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                </div>

                {/* Formulario de correo */}
                <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                    {modo === "registro" && (
                        <div className="auth-field auth-animate" style={inputWrap}>
                            <User size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                            <input
                                className="auth-input"
                                type="text"
                                autoComplete="name"
                                required
                                placeholder="Tu nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                    )}

                    <div className="auth-field" style={inputWrap}>
                        <Mail size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                        <input
                            className="auth-input"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            required
                            placeholder="tucorreo@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    {modo !== "recuperar" && (
                        <div className="auth-field" style={inputWrap}>
                            <Lock size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                            <input
                                className="auth-input"
                                type={verClave ? "text" : "password"}
                                autoComplete={modo === "registro" ? "new-password" : "current-password"}
                                required
                                minLength={6}
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={inputStyle}
                            />
                            <button type="button" onClick={() => setVerClave((v) => !v)} aria-label={verClave ? "Ocultar contraseña" : "Mostrar contraseña"} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: "0.25rem" }}>
                                {verClave ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    )}

                    {modo === "registro" && (
                        <div className="auth-field auth-animate" style={inputWrap}>
                            <Lock size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                            <input
                                className="auth-input"
                                type={verClave ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                minLength={6}
                                placeholder="Confirmar contraseña"
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                    )}

                    {modo === "login" && (
                        <button type="button" onClick={() => cambiarModo("recuperar")} className="auth-link" style={{ alignSelf: "flex-end", background: "transparent", border: "none", color: "var(--accent)", fontSize: "0.72rem", cursor: "pointer", padding: 0 }}>
                            ¿Olvidaste tu contraseña?
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-btn"
                        style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.8rem 1rem", marginTop: "0.15rem", borderRadius: "0.7rem", border: "1px solid color-mix(in srgb, var(--accent) 60%, var(--border))", background: "color-mix(in srgb, var(--accent) 22%, var(--surface-2))", color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {loading ? "Procesando…" : textoBoton}
                    </button>
                </form>

                {/* Cambios de modo */}
                <div key={`footer-${modo}`} className="auth-animate" style={{ textAlign: "center", marginTop: "1.2rem", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                    {modo === "login" && (
                        <span>¿No tienes cuenta?{" "}
                            <button type="button" onClick={() => cambiarModo("registro")} className="auth-link" style={{ background: "transparent", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 600, padding: 0 }}>Crea una</button>
                        </span>
                    )}
                    {modo === "registro" && (
                        <span>¿Ya tienes cuenta?{" "}
                            <button type="button" onClick={() => cambiarModo("login")} className="auth-link" style={{ background: "transparent", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 600, padding: 0 }}>Inicia sesión</button>
                        </span>
                    )}
                    {modo === "recuperar" && (
                        <button type="button" onClick={() => cambiarModo("login")} className="auth-link" style={{ background: "transparent", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 600, padding: 0 }}>← Volver a iniciar sesión</button>
                    )}
                </div>

                {/* Nota de seguridad */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", marginTop: "1.3rem", color: "var(--text-muted)", fontSize: "0.68rem" }}>
                    <ShieldCheck size={13} style={{ color: "var(--text)" }} />
                    <span>Acceso seguro · tus datos están protegidos</span>
                </div>
            </div>
        </div>
    );
}
