/**
 * BFF Endpoint: GET /api/users/list
 * Get all users (ADMIN only)
 */
import { NextRequest, NextResponse } from "next/server"
import { UsersListResponseSchema, mapBackendUserListItemToFrontend } from "@/lib/schemas/user.schema"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/shared/api-config"

export async function GET(request: NextRequest) {
  try {
    // 1. Get auth token from headers
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "No autorizado", error: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    // 2. Call backend
    const backendUrl = `${API_BASE_URL}${API_ENDPOINTS.users.list}`

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
      console.error("[BFF] Backend error:", errorData)

      return NextResponse.json(
        {
          message: errorData.message || "Error al obtener usuarios",
          error: errorData.error || "BACKEND_ERROR",
        },
        { status: backendResponse.status }
      )
    }

    // 3. Parse and validate backend response
    const backendData = await backendResponse.json()

    if (process.env.NODE_ENV === "development") {
      console.log("[BFF USERS LIST] Total users:", backendData.length)
    }

    const responseValidation = UsersListResponseSchema.safeParse(backendData)

    if (!responseValidation.success) {
      console.error("[BFF USERS LIST] Backend response validation failed:", responseValidation.error.errors)
      // Still return backend data even if validation fails (backend is source of truth)
      return NextResponse.json(backendData, { status: 200 })
    }

    // 4. Transform users (ADMIN/SUPPORT → admin/empleado)
    const transformedUsers = responseValidation.data.map(mapBackendUserListItemToFrontend)

    if (process.env.NODE_ENV === "development") {
      console.log("[BFF USERS LIST] Sample transformed user:", transformedUsers[0])
    }

    // 5. Return transformed response
    return NextResponse.json(transformedUsers, { status: 200 })
  } catch (error) {
    console.error("[BFF] Users list error:", error)
    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    )
  }
}
