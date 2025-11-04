/**
 * BFF Endpoint: GET /api/users/getById/:id
 * Get user by ID (ADMIN only)
 */
import { NextRequest, NextResponse } from "next/server"
import { BackendUserListItemSchema, mapBackendUserListItemToFrontend } from "@/lib/schemas/user.schema"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/shared/api-config"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 1. Get auth token from headers
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "No autorizado", error: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    // 2. Call backend
    const backendUrl = `${API_BASE_URL}${API_ENDPOINTS.users.detail(id)}`

    if (process.env.NODE_ENV === "development") {
      console.log(`[BFF] GET ${backendUrl}`)
    }

    const backendResponse = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      console.error("[BFF GET USER] Backend error:", errorData)

      return NextResponse.json(
        {
          message: errorData.message || "Error al obtener usuario",
          error: errorData.error || "BACKEND_ERROR",
        },
        { status: backendResponse.status }
      )
    }

    // 3. Parse and validate backend response
    const backendData = await backendResponse.json()

    if (process.env.NODE_ENV === "development") {
      console.log("[BFF GET USER] Backend response:", backendData)
    }

    const responseValidation = BackendUserListItemSchema.safeParse(backendData)

    if (!responseValidation.success) {
      console.error("[BFF GET USER] Backend response validation failed:", responseValidation.error.errors)
      // Still return backend data even if validation fails (backend is source of truth)
      return NextResponse.json(backendData, { status: 200 })
    }

    // 4. Transform user (ADMIN/SUPPORT → admin/empleado)
    const transformedUser = mapBackendUserListItemToFrontend(responseValidation.data)

    if (process.env.NODE_ENV === "development") {
      console.log("[BFF GET USER] Transformed user:", transformedUser)
    }

    // 5. Return transformed response
    return NextResponse.json(transformedUser, { status: 200 })
  } catch (error) {
    console.error("[BFF] Get user error:", error)
    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    )
  }
}
