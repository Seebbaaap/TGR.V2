"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import ThemeToggleBtn from "@/components/layout/ThemeToggleBtn";
import CollaborateBtn from "@/components/layout/CollaborateBtn";
import UserMenu from "@/components/layout/UserMenu";

export default function DashboardShell({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!sidebarOpen) return;
        const onKey = (e) => {
            if (e.key === "Escape") setSidebarOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [sidebarOpen]);

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100dvh",
                backgroundColor: "var(--bg)",
            }}
        >
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <header
                    style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        background: "var(--surface)",
                        borderBottom: "1px solid var(--border)",
                        paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))",
                    }}
                >
                    <div className="dash-header-row only-mobile">
                        <button
                            type="button"
                            aria-label="Abrir menú"
                            onClick={() => setSidebarOpen(true)}
                            className="btn-menu-hint"
                        >
                            <Menu size={18} />
                        </button>
                        <div className="dash-header-spacer" aria-hidden="true" />
                        <CollaborateBtn />
                        <div className="dash-header-spacer" aria-hidden="true" />
                        <ThemeToggleBtn />
                        <UserMenu />
                    </div>

                    <div className="dash-header-row only-desktop">
                        <CollaborateBtn />
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <ThemeToggleBtn />
                            <UserMenu />
                        </div>
                    </div>
                </header>

                <main
                    style={{
                        flex: 1,
                        minWidth: 0,
                        overflowX: "hidden",
                        overflowY: "auto",
                        padding: "var(--page-pad-y) var(--page-pad-x)",
                    }}
                >
                    <div style={{ width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
