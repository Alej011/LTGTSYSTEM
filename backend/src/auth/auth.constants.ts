export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

// Peticiones paralelas del BFF pueden presentar el mismo refresh token justo después de rotarlo.
// Dentro de esta ventana no se trata como robo: se emite solo un access token nuevo.
export const REFRESH_REUSE_GRACE_MS = 30_000;
