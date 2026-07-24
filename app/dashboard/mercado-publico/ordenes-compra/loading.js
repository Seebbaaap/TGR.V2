import LoadingState from "@/components/shared/LoadingState";

export default function Loading() {
    return (
        <LoadingState
            title="Cargando Órdenes de Compra"
            description="Cargando órdenes de compra desde Supabase."
        />
    );
}