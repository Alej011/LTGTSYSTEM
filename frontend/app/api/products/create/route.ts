/**
 * BFF Endpoint: POST /api/products/create
 * Create a new product
 */
import { NextRequest, NextResponse } from "next/server"
import { CreateProductRequestSchema, BackendProductSchema, mapBackendProductToFrontend } from "@/lib/schemas/product.schema"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config"

export async function POST(request: NextRequest) {
  try {
    // 1. Get auth token
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "No autorizado", error: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    // 2. Parse and validate request body
    const body = await request.json()

    if (process.env.NODE_ENV === "development") {
      console.log("[BFF CREATE] Request body:", JSON.stringify(body, null, 2))
    }

    const validationResult = CreateProductRequestSchema.safeParse(body)

    if (!validationResult.success) {
      console.error("[BFF CREATE] Validation failed:", validationResult.error.errors)
      return NextResponse.json(
        {
          message: "Datos del producto inválidos",
          error: "VALIDATION_ERROR",
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const productData = validationResult.data

    // 3. Call backend
    const backendUrl = `${API_BASE_URL}${API_ENDPOINTS.products.create}`

    if (process.env.NODE_ENV === "development") {
      console.log(`[BFF] POST ${backendUrl}`)
    }

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(productData),
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      console.error("[BFF] Backend error:", errorData)

      return NextResponse.json(
        {
          message: errorData.message || "Error al crear producto",
          error: errorData.error || "BACKEND_ERROR",
        },
        { status: backendResponse.status }
      )
    }

    // 4. Parse and validate backend response
    const backendData = await backendResponse.json()

    if (process.env.NODE_ENV === "development") {
      console.log("[BFF CREATE] Backend response:", JSON.stringify(backendData, null, 2))
    }

    const responseValidation = BackendProductSchema.safeParse(backendData)

    if (!responseValidation.success) {
      console.error("[BFF CREATE] Backend response validation failed:", responseValidation.error.errors)
      // Still return backend data even if validation fails (backend is source of truth)
      return NextResponse.json(backendData, { status: 201 })
    }

    // 5. Return validated response (dates already in ISO string format from backend)
    return NextResponse.json(responseValidation.data, { status: 201 })
  } catch (error) {
    console.error("[BFF] Create product error:", error)
    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    )
  }
}
