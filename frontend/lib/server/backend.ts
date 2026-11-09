import "server-only"
import { cookies, headers } from "next/headers"
import { NextResponse } from "next/server"
import type { z } from "zod"
import { API_BASE_URL, API_TIMEOUT } from "@/lib/shared/api-config"
import { ACCESS_COOKIE, getClientIp } from "./session"

type BackendErrorBody = { message?: string | string[]; error?: string }

export function errorResponse(status: number, message: string, error: string, details?: unknown) {
  return NextResponse.json({ message, error, ...(details ? { details } : {}) }, { status })
}

function dropNullish(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined && v !== null))
}

// Valida el cuerpo JSON de la petición. Devuelve los datos o la respuesta 400 lista para retornar.
// partial: ignora campos null, como envían los formularios de edición.
export async function parseBody<S extends z.ZodType>(
  request: Request,
  schema: S,
  message: string,
  { partial = false }: { partial?: boolean } = {},
): Promise<{ data: z.infer<S>; response?: never } | { data?: never; response: NextResponse }> {
  const raw = await request.json().catch(() => undefined)
  const result = schema.safeParse(partial ? dropNullish(raw) : raw)
  if (!result.success) {
    return { response: errorResponse(400, message, "VALIDATION_ERROR", result.error.issues) }
  }
  return { data: result.data }
}

type CallOptions<S extends z.ZodType> = {
  path: string
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
  // Si la respuesta del backend no cumple el esquema se responde 502 y no se reenvían los datos
  schema?: S
  errorMessage: string
  auth?: boolean
}

type CallResult<T> =
  | { ok: true; status: number; data: T; response?: never }
  | { ok: false; status: number; data?: never; response: NextResponse }

// Llama al backend con el access token de la cookie y la IP del cliente.
export async function callBackend<S extends z.ZodType = z.ZodUnknown>({
  path,
  method = "GET",
  body,
  schema,
  errorMessage,
  auth = true,
}: CallOptions<S>): Promise<CallResult<z.infer<S>>> {
  const requestHeaders = new Headers({ "Content-Type": "application/json" })

  if (auth) {
    const token = (await cookies()).get(ACCESS_COOKIE)?.value
    if (!token) {
      return { ok: false, status: 401, response: errorResponse(401, "Sesión no iniciada o expirada", "UNAUTHORIZED") }
    }
    requestHeaders.set("Authorization", `Bearer ${token}`)
  }

  const clientIp = getClientIp(await headers())
  if (clientIp) requestHeaders.set("X-Forwarded-For", clientIp)

  let backendResponse: Response
  try {
    backendResponse = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(API_TIMEOUT),
      cache: "no-store",
    })
  } catch (error) {
    console.error(`[BFF] ${method} ${path} sin respuesta del backend:`, error)
    return { ok: false, status: 502, response: errorResponse(502, "No se pudo conectar con el servidor", "BACKEND_UNAVAILABLE") }
  }

  const text = await backendResponse.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : undefined
  } catch {
    data = undefined
  }

  if (!backendResponse.ok) {
    const err = (data ?? {}) as BackendErrorBody
    const message = Array.isArray(err.message) ? err.message.join(", ") : err.message
    const status = backendResponse.status
    return { ok: false, status, response: errorResponse(status, message || errorMessage, err.error || "BACKEND_ERROR") }
  }

  if (!schema) return { ok: true, status: backendResponse.status, data: data as z.infer<S> }

  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    console.error(`[BFF] ${method} ${path} respuesta con formato inesperado:`, parsed.error.issues)
    return {
      ok: false,
      status: 502,
      response: errorResponse(502, "La respuesta del servidor no tiene el formato esperado", "INVALID_RESPONSE"),
    }
  }
  return { ok: true, status: backendResponse.status, data: parsed.data }
}

type ProxyOptions<S extends z.ZodType, R> = CallOptions<S> & {
  map?: (data: z.infer<S>) => R
  status?: number
}

// Atajo para rutas que solo reenvían: llama al backend y responde con los datos (opcionalmente transformados).
export async function proxyToBackend<S extends z.ZodType, R = z.infer<S>>({
  map,
  status,
  ...options
}: ProxyOptions<S, R>): Promise<NextResponse> {
  const result = await callBackend(options)
  if (!result.ok) return result.response
  const payload = map ? map(result.data) : result.data
  return NextResponse.json(payload ?? null, { status: status ?? result.status })
}
