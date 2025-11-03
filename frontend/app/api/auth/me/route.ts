/**
 * BFF Endpoint: GET /api/auth/me
 * Get current authenticated user from backend
 */
import { NextRequest, NextResponse } from "next/server"
import { CurrentUserResponseSchema, mapBackendUserToFrontend } from "@/lib/schemas/auth.schema"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config"

export async function GET(request: NextRequest) {
  try {
    // 1. Extract authorization token from request headers
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          message: "Token de autenticación no proporcionado",
          error: "UNAUTHORIZED",
        },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix

    // 2. Call backend to validate token and get user
    const backendUrl = `${API_BASE_URL}${API_ENDPOINTS.auth.me}`

    if (process.env.NODE_ENV === "development") {
      console.log(`[BFF] GET ${backendUrl}`)
    }

    const backendResponse = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    // 3. Handle backend errors
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))

      if (process.env.NODE_ENV === "development") {
        console.error("[BFF] Backend error:", errorData)
      }

      return NextResponse.json(
        {
          message: errorData.message || "Error al obtener usuario",
          error: errorData.error || "AUTHENTICATION_ERROR",
        },
        { status: backendResponse.status }
      )
    }

    // 4. Parse and validate backend response
    const backendData = await backendResponse.json()

    const responseValidation = CurrentUserResponseSchema.safeParse(backendData)
    if (!responseValidation.success) {
      console.error("[BFF] Backend response validation failed:", responseValidation.error)
      return NextResponse.json(
        {
          message: "Error en la respuesta del servidor",
          error: "INVALID_RESPONSE",
        },
        { status: 500 }
      )
    }

    // 5. Transform backend user to frontend format
    const frontendUser = mapBackendUserToFrontend(responseValidation.data)

    if (process.env.NODE_ENV === "development") {
      console.log("[BFF Me] Backend user role:", responseValidation.data.role)
      console.log("[BFF Me] Frontend user role:", frontendUser.role)
      console.log("[BFF Me] Full backend user:", responseValidation.data)
      console.log("[BFF Me] Full transformed user:", frontendUser)
    }

    // 6. Return successful response
    // Dates are already ISO strings from backend, no need to transform
    return NextResponse.json(frontendUser, { status: 200 })
  } catch (error) {
    console.error("[BFF] Get current user error:", error)

    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    )
  }
}
