import Link from "next/link";

const modules = [
    {
        href: "/dashboard/mercado-publico/compra-agil",
        title: "Compra Ágil",
        description: "Registros sincronizados desde Mercado Público y almacenados en Supabase.",
        accent: "border-cyan-500/30 text-cyan-300",
    },
    {
        href: "/dashboard/mercado-publico/licitaciones",
        title: "Licitaciones",
        description: "Procesos de licitación disponibles desde la base de datos local.",
        accent: "border-violet-500/30 text-violet-300",
    },
    {
        href: "/dashboard/mercado-publico/ordenes-compra",
        title: "Órdenes de Compra",
        description: "Órdenes de compra del Estado, servidas desde Base de Datos",
        accent: "border-emerald-500/30 text-emerald-300",
    },
];

export default function MercadoPublicoPage() {
    return (
        <section className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-cyan-300">
                    APIs públicas
                </p>
                <h1 className="text-3xl font-bold text-white">Mercado Público</h1>
                <p className="mt-2 max-w-3xl text-slate-400">
                    Licitaciones, órdenes de compra y compras ágiles se sincronizan
                    periódicamente hacia Supabase mediante workflows programados.
                    Las vistas del dashboard leen siempre desde esa base de datos.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {modules.map((module) => (
                    <Link
                        key={module.href}
                        href={module.href}
                        className={`rounded-2xl border bg-slate-950/70 p-6 transition hover:bg-slate-900/80 ${module.accent}`}
                    >
                        <h2 className="text-xl font-semibold">{module.title}</h2>
                        <p className="mt-3 text-sm text-slate-300">{module.description}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
}
