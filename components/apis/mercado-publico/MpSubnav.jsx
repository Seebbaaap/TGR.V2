"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
    { href: "/dashboard/mercado-publico/compra-agil", label: "Compra Ágil" },
    { href: "/dashboard/mercado-publico/licitaciones", label: "Licitaciones" },
    { href: "/dashboard/mercado-publico/ordenes-compra", label: "Órdenes de Compra" },
];

export default function MpSubnav() {
    const pathname = usePathname();

    return (
        <nav style={{ marginBottom: "1.25rem" }} aria-label="Módulos Mercado Público">
            <div className="mp-subnav-row">
                {items.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={item.label}
                            className="mp-subnav-link"
                            style={{
                                border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                                background: active
                                    ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                                    : "var(--surface-2)",
                                color: active ? "var(--accent)" : "var(--text-secondary)",
                                fontWeight: active ? 600 : 400,
                            }}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
