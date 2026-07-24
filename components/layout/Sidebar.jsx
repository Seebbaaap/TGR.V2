"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

const nav = [
    {
        grupo: "FUENTES DE DATOS",
        items: [
            {
                href: "/dashboard/tgr",
                label: "TGR",
                desc: "Remates judiciales",
                badge: true,
                icon: (
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <rect x="3" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="3" width="7" height="7" rx="1.5" />
                        <rect x="3" y="14" width="7" height="7" rx="1.5" />
                        <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    </svg>
                ),
            },
            {
                href: "/dashboard/mercado-publico/compra-agil",
                label: "Mercado Público",
                desc: "Compras del Estado (3 módulos)",
                icon: (
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                ),
            },
        ],
    },
];

const mpItems = [
    { href: "/dashboard/mercado-publico/compra-agil", label: "Compra Ágil" },
    { href: "/dashboard/mercado-publico/licitaciones", label: "Licitaciones" },
    { href: "/dashboard/mercado-publico/ordenes-compra", label: "Órdenes de Compra" },
];

export default function Sidebar({ open = false, onClose }) {
    const pathname = usePathname();
    const enMP = pathname.startsWith("/dashboard/mercado-publico");

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/55 lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex min-h-dvh shrink-0 flex-col transition-transform duration-200 ease-out lg:static lg:z-auto lg:translate-x-0 ${
                    open ? "translate-x-0" : "-translate-x-full pointer-events-none lg:pointer-events-auto"
                }`}
                style={{
                    width: "var(--sidebar-w)",
                    background: "var(--surface)",
                    borderRight: "1px solid var(--border)",
                }}
            >
                <div style={{
                    padding: "1rem 1rem 0.85rem",
                    borderBottom: "1px solid var(--border)",
                }}>
                    <div className="mb-2 flex items-start justify-between gap-2">
                        <div style={{
                            width: "100%",
                            borderRadius: "10px",
                            overflow: "hidden",
                            border: "1px solid var(--border)",
                            lineHeight: 0,
                        }}>
                            <Image
                                src="/logo-hublab.jpg"
                                alt="HubLab logo"
                                width={220}
                                height={80}
                                style={{
                                    width: "100%",
                                    height: "auto",
                                    objectFit: "contain",
                                    display: "block",
                                }}
                            />
                        </div>
                        <button
                            type="button"
                            aria-label="Cerrar menú"
                            onClick={onClose}
                            className="mt-1 shrink-0 rounded-lg p-1.5 lg:hidden"
                            style={{
                                border: "1px solid var(--border)",
                                background: "var(--surface-2)",
                                color: "var(--text-muted)",
                                cursor: "pointer",
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div style={{ textAlign: "center" }}>
                        <div style={{
                            fontFamily: "monospace",
                            fontWeight: 800,
                            fontSize: "1rem",
                            lineHeight: 1.1,
                        }}>
                            <span style={{ color: "var(--text-secondary)" }}>Estado</span>
                            <span style={{ color: "var(--accent)" }}>HUB</span>
                        </div>
                        <p style={{
                            fontSize: "0.6rem",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            marginTop: "3px",
                        }}>
                            APIs Públicas del Estado
                        </p>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: "1rem 0.75rem", overflowY: "auto" }}>
                    {nav.map((grupo) => (
                        <div key={grupo.grupo} style={{ marginBottom: "0.5rem" }}>
                            <p style={{
                                fontSize: "0.6rem",
                                fontWeight: 700,
                                letterSpacing: "0.15em",
                                textTransform: "uppercase",
                                color: "var(--text-muted)",
                                padding: "0 0.25rem",
                                marginBottom: "0.5rem",
                            }}>
                                {grupo.grupo}
                            </p>

                            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                                {grupo.items.map((item) => {
                                    const isTGR = item.href === "/dashboard/tgr";
                                    const isMP = item.href.startsWith("/dashboard/mercado-publico");
                                    const active = isTGR
                                        ? pathname.startsWith("/dashboard/tgr")
                                        : isMP
                                            ? pathname.startsWith("/dashboard/mercado-publico")
                                            : pathname === item.href;

                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                onClick={onClose}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.75rem",
                                                    padding: "0.65rem 0.75rem",
                                                    borderRadius: "0.6rem",
                                                    textDecoration: "none",
                                                    background: active
                                                        ? "color-mix(in srgb, var(--accent) 10%, var(--surface-2))"
                                                        : "var(--surface-2)",
                                                    border: `1px solid ${active
                                                        ? "color-mix(in srgb, var(--accent) 30%, var(--border))"
                                                        : "var(--border)"}`,
                                                    transition: "all 150ms ease",
                                                }}
                                            >
                                                <span style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    width: "32px",
                                                    height: "32px",
                                                    borderRadius: "7px",
                                                    background: active
                                                        ? "color-mix(in srgb, var(--accent) 15%, var(--surface))"
                                                        : "var(--surface)",
                                                    color: active ? "var(--accent)" : "var(--text-muted)",
                                                    flexShrink: 0,
                                                    border: "1px solid var(--border)",
                                                }}>
                                                    {item.icon}
                                                </span>

                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{
                                                        fontSize: "0.82rem",
                                                        fontWeight: 600,
                                                        color: active ? "var(--accent)" : "var(--text-secondary)",
                                                        lineHeight: 1.2,
                                                        margin: 0,
                                                    }}>
                                                        {item.label}
                                                    </p>
                                                    <p style={{
                                                        fontSize: "0.68rem",
                                                        color: "var(--text-muted)",
                                                        marginTop: "1px",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        margin: 0,
                                                    }}>
                                                        {item.desc}
                                                    </p>
                                                </div>

                                                {item.badge && isTGR && active && (
                                                    <span style={{
                                                        width: "7px",
                                                        height: "7px",
                                                        borderRadius: "50%",
                                                        background: "var(--accent)",
                                                        boxShadow: "0 0 6px var(--accent)",
                                                        flexShrink: 0,
                                                    }} />
                                                )}
                                            </Link>

                                            {isMP && enMP && (
                                                <ul style={{
                                                    listStyle: "none",
                                                    paddingLeft: "0.75rem",
                                                    marginTop: "0.25rem",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "1px",
                                                    borderLeft: "1px solid var(--border)",
                                                    marginLeft: "1.25rem",
                                                }}>
                                                    {mpItems.map((sub) => {
                                                        const subActive = pathname === sub.href;
                                                        return (
                                                            <li key={sub.href}>
                                                                <Link
                                                                    href={sub.href}
                                                                    onClick={onClose}
                                                                    style={{
                                                                        display: "block",
                                                                        padding: "0.35rem 0.6rem",
                                                                        borderRadius: "0.4rem",
                                                                        fontSize: "0.78rem",
                                                                        fontWeight: subActive ? 600 : 400,
                                                                        color: subActive ? "var(--accent)" : "var(--text-secondary)",
                                                                        textDecoration: "none",
                                                                        background: subActive
                                                                            ? "color-mix(in srgb, var(--accent) 8%, transparent)"
                                                                            : "transparent",
                                                                        transition: "all 120ms ease",
                                                                    }}
                                                                >
                                                                    {sub.label}
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
}
