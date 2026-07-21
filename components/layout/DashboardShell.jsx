import Sidebar from "@/components/layout/Sidebar";
import ThemeToggleBtn from "@/components/layout/ThemeToggleBtn";
import CollaborateBtn from "@/components/layout/CollaborateBtn";

export default function DashboardShell({ children, titulo, subtitulo }) {
    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg)" }}>
            <Sidebar />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
                        <CollaborateBtn />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "auto" }}>
                        <ThemeToggleBtn />
                    </div>
                </header>

                <main style={{ flex: 1, padding: "1.5rem", overflowX: "auto" }}>
                    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}