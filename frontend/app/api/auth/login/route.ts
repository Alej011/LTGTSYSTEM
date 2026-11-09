import { NextResponse } from "next/server"
import { LoginRequestSchema, mapBackendUserToFrontend } from "@/lib/schemas/auth.schema"
import { API_ENDPOINTS } from "@/lib/shared/api-config"
import { callBackend, parseBody } from "@/lib/server/backend"
import { SessionTokensSchema, setSessionCookies } from "@/lib/server/session"

export async function POST(request: Request) {
  const body = await parseBody(request, LoginRequestSchema, "Datos de inicio de sesión inválidos")
  if (body.response) return body.response

  const result = await callBackend({
    path: API_ENDPOINTS.auth.login,
    method: "POST",
    body: body.data,
    schema: SessionTokensSchema,
    errorMessage: "Error al iniciar sesión",
    auth: false,
  })
  if (!result.ok) return result.response

  // Los tokens viajan solo en cookies HttpOnly; el navegador recibe únicamente el usuario
  const response = NextResponse.json({ user: mapBackendUserToFrontend(result.data.user) })
  setSessionCookies(response, result.data)
  return response
}
