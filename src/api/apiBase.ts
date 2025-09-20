// src/apiBase.ts
export const API_BASE =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_API_URL   // local dev proxy
    : import.meta.env.VITE_API_TARGET; // production backend
