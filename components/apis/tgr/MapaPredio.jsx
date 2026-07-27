"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icono = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

export default function MapaPredio({
    rol,
    direccion,
    comuna,
    fallbackLat,
    fallbackLng,
}) {
    const [coords, setCoords] = useState(
        fallbackLat && fallbackLng
            ? { lat: fallbackLat, lng: fallbackLng, fuente: "fallback" }
            : null
    );

    const [loading, setLoading] = useState(!coords);

    useEffect(() => {
        let activo = true;

        async function cargarCoordsExactas() {
            try {
                setLoading(true);

                const res = await fetch("/api/remates/geocodificar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rol, direccion, comuna }),
                });

                const contentType = res.headers.get("content-type") || "";

                if (!res.ok) {
                    const texto = await res.text();
                    throw new Error(`API ${res.status}: ${texto.slice(0, 300)}`);
                }

                if (!contentType.includes("application/json")) {
                    const texto = await res.text();
                    throw new Error(`La API no devolvió JSON. Respuesta: ${texto.slice(0, 300)}`);
                }

                const data = await res.json();

                if (activo && data?.coords?.lat && data?.coords?.lng) {
                    setCoords(data.coords);
                }
            } catch (error) {
                console.error("Error geocodificando predio:", error);
            } finally {
                if (activo) setLoading(false);
            }
        }

        if (rol) {
            cargarCoordsExactas();
        }

        return () => {
            activo = false;
        };
    }, [rol, direccion, comuna]);

    if (!coords && loading) {
        return (
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Buscando ubicación exacta...
            </p>
        );
    }

    if (!coords) {
        return (
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Sin coordenadas disponibles.
            </p>
        );
    }

    return (
        <div style={{ width: "100%" }}>
            <div style={{ height: "220px", width: "100%", borderRadius: "8px", overflow: "hidden" }}>
                <MapContainer
                    center={[coords.lat, coords.lng]}
                    zoom={17}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />
                    <Marker position={[coords.lat, coords.lng]} icon={icono}>
                        <Popup>{direccion || comuna || "Ubicación del predio"}</Popup>
                    </Marker>
                </MapContainer>
            </div>

            {coords.precision === "APPROXIMATE" && (
                <p style={{ fontSize: "0.7rem", color: "var(--warning)", marginTop: "6px" }}>
                    ⚠ Ubicación aproximada (a nivel de zona), no exacta al predio.
                </p>
            )}
        </div>
    );
}