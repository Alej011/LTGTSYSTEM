// Primera IP de X-Forwarded-For. Solo es fiable si un proxy de confianza delante de Next la sobrescribe.
export function getClientIp(headers: Headers): string | null {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
}
