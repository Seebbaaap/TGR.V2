"use client";

import { useState } from "react";
import CollaborateModal from "./CollaborateModal";

export default function CollaborateBtn() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                className="collab-btn"
                onClick={() => setOpen(true)}
                title="Sumarte al proyecto"
                aria-label="¿Quieres colaborar?"
            >
                <span className="collab-btn-icon" aria-hidden="true">✉</span>
                <span className="collab-btn-text">
                    <span className="collab-btn-title">¿Quieres colaborar?</span>
                    <span className="collab-sub">Súmate acá</span>
                </span>
            </button>

            {open && <CollaborateModal onClose={() => setOpen(false)} />}
        </>
    );
}
