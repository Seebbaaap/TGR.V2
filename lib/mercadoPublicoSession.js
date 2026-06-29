export const MP_SYNC_SESSION_KEY = "mp-sync-session-v1";
export const MP_SYNC_READY_EVENT = "mp-sync-ready";

export function yaSeSincronizoEnSesion() {
    if (typeof window === "undefined") return false;
    return Boolean(sessionStorage.getItem(MP_SYNC_SESSION_KEY));
}

export function marcarSincronizacionEnSesion() {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(MP_SYNC_SESSION_KEY, String(Date.now()));
}

export function emitirSyncReady(detail = { ok: true }) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(MP_SYNC_READY_EVENT, { detail }));
}