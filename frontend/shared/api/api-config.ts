// URL del backend. Solo la usan las rutas BFF (servidor) y se lee al arrancar, no en el build.
export const API_BASE_URL = process.env.API_URL || 'http://localhost:4000';

// Timeout por defecto para las peticiones
export const API_TIMEOUT = 10000; // 10 segundos
