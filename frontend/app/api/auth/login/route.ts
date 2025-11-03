/**
 * BFF Endpoint: POST /api/auth/login
 * Proxy to backend authentication service with validation
 */
import { NextRequest, NextResponse } from "next/server"
import { LoginRequestSchema, LoginResponseSchema, mapBackendUserToFrontend } from "@/lib/schemas/auth.schema"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config"

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json()

    // 2. Validate request data with Zod
    const validationResult = LoginRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Datos de inicio de sesión inválidos",
          error: "VALIDATION_ERROR",
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // 3. Call backend authentication service
    const backendUrl = `${API_BASE_URL}${API_ENDPOINTS.auth.login}`

    if (process.env.NODE_ENV === "development") {
      console.log(`[BFF] POST ${backendUrl}`)
    }

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    // 4. Handle backend errors
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))

      if (process.env.NODE_ENV === "development") {
        console.error("[BFF] Backend error:", errorData)
      }

      return NextResponse.json(
        {
          message: errorData.message || "Error al iniciar sesión",
          error: errorData.error || "AUTHENTICATION_ERROR",
        },
        { status: backendResponse.status }
      )
    }

    // 5. Parse and validate backend response
    const backendData = await backendResponse.json()

    const responseValidation = LoginResponseSchema.safeParse(backendData)
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

    // 6. Transform backend user to frontend format
    const { accessToken, user: backendUser } = responseValidation.data
    const frontendUser = mapBackendUserToFrontend(backendUser)

    if (process.env.NODE_ENV === "development") {
      console.log("[BFF Login] Backend user role:", backendUser.role)
      console.log("[BFF Login] Frontend user role:", frontendUser.role)
      console.log("[BFF Login] Full backend user:", backendUser)
      console.log("[BFF Login] Full transformed user:", frontendUser)
    }

    // 7. Return successful response with transformed data
    // Dates are already ISO strings from backend, no need to transform
    return NextResponse.json(
      {
        accessToken,
        user: frontendUser, // Already has dates as ISO strings
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[BFF] Login error:", error)

    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    )
  }
}
