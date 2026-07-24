"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import ThemeToggleBtn from "@/components/layout/ThemeToggleBtn";
import CollaborateBtn from "@/components/layout/CollaborateBtn";

export default function DashboardShell({ children, titulo, subtitulo }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg)" }}>

            {/* Estilos responsive del layout (tablets y teléfonos) */}
            <style>{`
                .dash-hamburger { display: none; }
                .dash-backdrop { display: none; }
                @media (max-width: 900px) {
                    .dash-hamburger { display: inline-flex; }
                    .dash-sidebar {
                        position: fixed;
                        top: 0;
                        left: 0;
                        height: 100dvh;
                        z-index: 60;
                        transform: translateX(-100%);
                        transition: transform 220ms ease;
                        box-shadow: 2px 0 20px rgba(0, 0, 0, 0.45);
                    }
                    .dash-sidebar.dash-open { transform: translateX(0); }
                    .dash-backdrop {
                        display: block;
                        position: fixed;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.55);
                        z-index: 55;
                    }
                }
            `}</style>

            {/* Fondo oscuro para cerrar el drawer (solo visible en móvil cuando está abierto) */}
            {sidebarOpen && (
                <div
                    className="dash-backdrop"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <header
                    style={{
                        background: "var(--surface)",
                        borderBottom: "1px solid var(--border)",
                        padding: "0.875rem 1.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "1rem",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                        {/* Botón hamburguesa — solo visible en móvil/tablet */}
                        <button
                            className="dash-hamburger"
                            onClick={() => setSidebarOpen((v) => !v)}
                            aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                width: "38px",
                                height: "38px",
                                borderRadius: "9px",
                                background: "var(--surface-2)",
                                border: "1px solid var(--border)",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                flexShrink: 0,
                            }}
                        >
                            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>

                        <CollaborateBtn />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "auto" }}>
                        <ThemeToggleBtn />
                    </div>
                </header>

                <main style={{ flex: 1, padding: "1.5rem", overflowX: "auto" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
