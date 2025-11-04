/**
 * BFF Endpoint: POST /api/users/create
 * Create a new user (ADMIN only)
 */
import { NextRequest, NextResponse } from "next/server"
import { CreateUserRequestSchema, BackendUserListItemSchema, mapBackendUserListItemToFrontend } from "@/lib/schemas/user.schema"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config"

export async function POST(request: NextRequest) {
  try {
    // 1. Get auth token from headers
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "No autorizado", error: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    // 2. Parse and validate request body
    const body = await request.json()

    const validationResult = CreateUserRequestSchema.safeParse(body)
    if (!validationResult.success) {
      console.error("[BFF CREATE USER] Validation failed:", validationResult.error.errors)
      return NextResponse.json(
        {
          message: "Datos del usuario inválidos",
          error: "VALIDATION_ERROR",
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    // 3. Call backend
    const backendUrl = `${API_BASE_URL}${API_ENDPOINTS.users.create}`

    if (process.env.NODE_ENV === "development") {
      console.log(`[BFF] POST ${backendUrl}`)
      console.log("[BFF CREATE USER] Request body:", validationResult.data)
    }

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(validationResult.data),
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      console.error("[BFF CREATE USER] Backend error:", errorData)

      return NextResponse.json(
        {
          message: errorData.message || "Error al crear usuario",
          error: errorData.error || "BACKEND_ERROR",
        },
        { status: backendResponse.status }
      )
    }

    // 4. Parse and validate backend response
    const backendData = await backendResponse.json()

    if (process.env.NODE_ENV === "development") {
      console.log("[BFF CREATE USER] Backend response:", backendData)
    }

    const responseValidation = BackendUserListItemSchema.safeParse(backendData)

    if (!responseValidation.success) {
      console.error("[BFF CREATE USER] Backend response validation failed:", responseValidation.error.errors)
      // Still return backend data even if validation fails (backend is source of truth)
      return NextResponse.json(backendData, { status: 201 })
    }

    // 5. Transform user (ADMIN/SUPPORT → admin/empleado)
    const transformedUser = mapBackendUserListItemToFrontend(responseValidation.data)

    if (process.env.NODE_ENV === "development") {
      console.log("[BFF CREATE USER] Transformed user:", transformedUser)
    }

    // 6. Return transformed response
    return NextResponse.json(transformedUser, { status: 201 })
  } catch (error) {
    console.error("[BFF] Create user error:", error)
    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    )
  }
}
