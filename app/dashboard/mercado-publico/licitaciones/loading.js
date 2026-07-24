import LoadingState from "@/components/shared/LoadingState";

export default function Loading() {
    return (
        <LoadingState
            title="Cargando Licitaciones"
            description="Cargando licitaciones desde Supabase."
        />
    );
}