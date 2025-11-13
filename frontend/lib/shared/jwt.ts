type JwtPayload = {
  role?: string
  [key: string]: unknown
}

function decodeBase64UrlSegment(segment: string): string {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/")
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  )

  if (typeof atob === "function") {
    return atob(padded)
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf-8")
  }

  throw new Error("No base64 decoder available in this environment")
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  const payloadSegment = token.split(".")[1]
  if (!payloadSegment) return null

  try {
    const json = decodeBase64UrlSegment(payloadSegment)
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

export function getRoleFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token)
  if (!payload?.role) return null
  return String(payload.role).toLowerCase()
}
