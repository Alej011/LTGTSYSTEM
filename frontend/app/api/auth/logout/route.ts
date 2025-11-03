/**
 * BFF Endpoint: POST /api/auth/logout
 * Handle user logout (currently client-side only, can be extended for token invalidation)
 */
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Extract token from request (for future backend logout endpoint)
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // If no token, logout is still successful (idempotent)
      return NextResponse.json(
        {
          message: "Sesión cerrada exitosamente",
        },
        { status: 200 }
      )
    }

    // TODO: If backend implements logout endpoint, call it here
    // const token = authHeader.substring(7)
    // await fetch(`${API_BASE_URL}/api/auth/logout`, {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${token}` }
    // })

    // For now, just return success
    // Token removal is handled on the client side
    return NextResponse.json(
      {
        message: "Sesión cerrada exitosamente",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[BFF] Logout error:", error)

    // Even on error, logout should succeed on client
    return NextResponse.json(
      {
        message: "Sesión cerrada exitosamente",
      },
      { status: 200 }
    )
  }
}
