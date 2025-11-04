/**
 * BFF Endpoints: /api/products/[id]
 * GET - Get product by ID
 * PATCH - Update product
 * DELETE - Delete product
 */
import { NextRequest, NextResponse } from "next/server"
import { UpdateProductRequestSchema, BackendProductSchema, mapBackendProductToFrontend } from "@/lib/schemas/product.schema"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/shared/api-config"

/**
 * GET /api/products/[id]
 * Get product by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 1. Get auth token
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "No autorizado", error: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    // 2. Call backend
    const backendUrl = `${API_BASE_URL}${API_ENDPOINTS.products.detail(id)}`

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
          message: errorData.message || "Error al obtener producto",
          error: errorData.error || "BACKEND_ERROR",
        },
        { status: backendResponse.status }
      )
    }

    // 3. Parse and validate backend response
    const backendData = await backendResponse.json()

    if (process.env.NODE_ENV === "development") {
      console.log("[BFF GET] Backend response:", JSON.stringify(backendData, null, 2))
    }

    const responseValidation = BackendProductSchema.safeParse(backendData)

    if (!responseValidation.success) {
      console.error("[BFF GET] Backend response validation failed:", responseValidation.error.errors)
      // Still return backend data even if validation fails (backend is source of truth)
      return NextResponse.json(backendData, { status: 200 })
    }

    // 4. Return validated response (dates already in ISO string format from backend)
    return NextResponse.json(responseValidation.data, { status: 200 })
  } catch (error) {
    console.error("[BFF] Get product error:", error)
    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/products/[id]
 * Update product
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 1. Get auth token
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "No autorizado", error: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    // 2. Parse and validate request body
    const rawBody = await request.json()

    // Remove undefined and null values to avoid validation issues
    const body = Object.fromEntries(
      Object.entries(rawBody).filter(([_, v]) => v !== undefined && v !== null)
    )

    if (process.env.NODE_ENV === "development") {
      console.log("[BFF PATCH] Request body (cleaned):", JSON.stringify(body, null, 2))
    }

    // Validate with UpdateProductRequestSchema
    const validationResult = UpdateProductRequestSchema.safeParse(body)

    if (!validationResult.success) {
      console.error("[BFF PATCH] Validation failed:", validationResult.error.errors)
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
    const backendUrl = `${API_BASE_URL}${API_ENDPOINTS.products.update(id)}`

    if (process.env.NODE_ENV === "development") {
      console.log(`[BFF] PATCH ${backendUrl}`)
    }

    const backendResponse = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(productData),
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      return NextResponse.json(
        {
          message: errorData.message || "Error al actualizar producto",
          error: errorData.error || "BACKEND_ERROR",
        },
        { status: backendResponse.status }
      )
    }

    // 4. Parse and validate backend response
    const backendData = await backendResponse.json()

    if (process.env.NODE_ENV === "development") {
      console.log("[BFF PATCH] Backend response:", JSON.stringify(backendData, null, 2))
    }

    const responseValidation = BackendProductSchema.safeParse(backendData)

    if (!responseValidation.success) {
      console.error("[BFF PATCH] Backend response validation failed:", responseValidation.error.errors)
      // Still return backend data even if validation fails (backend is source of truth)
      return NextResponse.json(backendData, { status: 200 })
    }

    // 5. Return validated response (dates already in ISO string format from backend)
    return NextResponse.json(responseValidation.data, { status: 200 })
  } catch (error) {
    console.error("[BFF] Update product error:", error)
    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/products/[id]
 * Delete product
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 1. Get auth token
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "No autorizado", error: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    // 2. Call backend
    const backendUrl = `${API_BASE_URL}${API_ENDPOINTS.products.delete(id)}`

    if (process.env.NODE_ENV === "development") {
      console.log(`[BFF] DELETE ${backendUrl}`)
    }

    const backendResponse = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      return NextResponse.json(
        {
          message: errorData.message || "Error al eliminar producto",
          error: errorData.error || "BACKEND_ERROR",
        },
        { status: backendResponse.status }
      )
    }

    // 3. Return success
    return NextResponse.json(
      {
        message: "Producto eliminado exitosamente",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[BFF] Delete product error:", error)
    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    )
  }
}
