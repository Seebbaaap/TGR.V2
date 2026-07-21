"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function UserMenu() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [open, setOpen] = useState(false);
    const [saliendo, setSaliendo] = useState(false);
    const boxRef = useRef(null);

    useEffect(() => {
        const supabase = createSupabaseBrowserClient();
        supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
        const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
            setUser(session?.user ?? null);
        });
        return () => sub.subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!open) return;
        const onClick = (e) => {
            if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [open]);

    async function cerrarSesion() {
        setSaliendo(true);
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        router.replace("/login");
        router.refresh();
    }

    if (!user) return null;

    const nombre =
        user.user_metadata?.full_name || user.user_metadata?.name || "";
    const email = user.email || "";
    const avatar = user.user_metadata?.avatar_url;
    const inicial = (nombre || email || "?").trim().charAt(0).toUpperCase();

    return (
        <div ref={boxRef} style={{ position: "relative", flexShrink: 0 }}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Menú de usuario"
                aria-expanded={open}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "2.35rem",
                    height: "2.35rem",
                    padding: 0,
                    borderRadius: "999px",
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    cursor: "pointer",
                    overflow: "hidden",
                    color: "var(--text-secondary)",
                }}
            >
                {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={avatar}
                        alt={nombre || email}
                        referrerPolicy="no-referrer"
                        width={38}
                        height={38}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--accent)" }}>
                        {inicial}
                    </span>
                )}
            </button>

            {open && (
                <div
                    role="menu"
                    style={{
                        position: "absolute",
                        top: "calc(100% + 0.5rem)",
                        right: 0,
                        minWidth: "13.5rem",
                        zIndex: 50,
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.75rem",
                        boxShadow: "0 18px 40px -18px rgba(0,0,0,0.7)",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.6rem",
                            padding: "0.75rem 0.85rem",
                            borderBottom: "1px solid var(--border)",
                        }}
                    >
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "2rem",
                                height: "2rem",
                                borderRadius: "999px",
                                background: "color-mix(in srgb, var(--accent) 15%, var(--surface-2))",
                                color: "var(--accent)",
                                flexShrink: 0,
                            }}
                        >
                            <UserIcon size={15} />
                        </span>
                        <div style={{ minWidth: 0 }}>
                            {nombre && (
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "0.78rem",
                                        fontWeight: 600,
                                        color: "var(--text-secondary)",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {nombre}
                                </p>
                            )}
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "0.68rem",
                                    color: "var(--text-muted)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {email}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={cerrarSesion}
                        disabled={saliendo}
                        role="menuitem"
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.55rem",
                            padding: "0.7rem 0.85rem",
                            background: "transparent",
                            border: "none",
                            color: "var(--danger)",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                            cursor: saliendo ? "not-allowed" : "pointer",
                            textAlign: "left",
                        }}
                    >
                        <LogOut size={15} />
                        {saliendo ? "Cerrando…" : "Cerrar sesión"}
                    </button>
                </div>
            )}
        </div>
    );
}
