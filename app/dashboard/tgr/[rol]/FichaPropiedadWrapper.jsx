"use client";

import FichaPropiedad from "@/components/apis/tgr/FichaPropiedad";

export default function FichaPropiedadWrapper({ remate, analisis, errorAnalisis, rolFormato }) {
    return (
        <FichaPropiedad
            remate={remate}
            analisis={analisis}
            errorAnalisis={errorAnalisis}
            rolFormato={rolFormato}
        />
    );
}