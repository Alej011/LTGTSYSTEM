/**
 * BFF Endpoint: GET /api/brands
 * Get all brands
 */
import { NextRequest, NextResponse } from "next/server"
import { BrandsResponseSchema } from "@/lib/schemas/product.schema"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/shared/api-config"

export async function GET(request: NextRequest) {
  try {
    // 1. Get auth token
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "No autorizado", error: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    // 2. Call backend
    const backendUrl = `${API_BASE_URL}${API_ENDPOINTS.brands.list}`

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
      return NextResponse.json(
        {
          message: errorData.message || "Error al obtener marcas",
          error: errorData.error || "BACKEND_ERROR",
        },
        { status: backendResponse.status }
      )
    }

    // 3. Parse and validate response
    const backendData = await backendResponse.json()
    const responseValidation = BrandsResponseSchema.safeParse(backendData)

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

    // 4. Return response (dates already in string format from backend)
    return NextResponse.json(responseValidation.data, { status: 200 })
  } catch (error) {
    console.error("[BFF] Get brands error:", error)
    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    )
  }
}
