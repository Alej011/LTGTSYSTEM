/**
 * BFF Endpoint: GET /api/products/list
 * Get paginated products with filters
 */
import { NextRequest, NextResponse } from "next/server"
import { ProductFiltersSchema, PaginatedProductsSchema, mapBackendProductToFrontend } from "@/lib/schemas/product.schema"
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

    // 2. Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams
    const filters = {
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      status: (searchParams.get("status") as "active" | "inactive" | "discontinued" | null) || undefined,
      brandId: searchParams.get("brandId") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      sortBy: (searchParams.get("sortBy") as "name" | "price" | "stock" | "createdAt" | null) || undefined,
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc" | null) || undefined,
    }

    const validationResult = ProductFiltersSchema.safeParse(filters)
    if (!validationResult.success) {
      console.error("[BFF] Filter validation failed:", validationResult.error.errors)
      console.error("[BFF] Filters received:", filters)
      return NextResponse.json(
        {
          message: "Parámetros de búsqueda inválidos",
          error: "VALIDATION_ERROR",
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    // 3. Build query string for backend
    const params = new URLSearchParams()
    if (filters.search) params.append("search", filters.search)
    if (filters.category) params.append("category", filters.category)
    if (filters.status) params.append("status", filters.status)
    if (filters.brandId) params.append("brandId", filters.brandId)
    if (filters.page) params.append("page", filters.page.toString())
    if (filters.limit) params.append("limit", filters.limit.toString())
    if (filters.sortBy) params.append("sortBy", filters.sortBy)
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder)

    const queryString = params.toString()
    const backendUrl = `${API_BASE_URL}${API_ENDPOINTS.products.list}${queryString ? `?${queryString}` : ""}`

    if (process.env.NODE_ENV === "development") {
      console.log(`[BFF] GET ${backendUrl}`)
    }

    // 4. Call backend
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
          message: errorData.message || "Error al obtener productos",
          error: errorData.error || "BACKEND_ERROR",
        },
        { status: backendResponse.status }
      )
    }

    // 5. Parse and validate backend response
    const backendData = await backendResponse.json()

    if (process.env.NODE_ENV === "development") {
      console.log("[BFF LIST] Backend response meta:", backendData.meta)
      console.log("[BFF LIST] Total products:", backendData.data?.length)
    }

    const responseValidation = PaginatedProductsSchema.safeParse(backendData)

    if (!responseValidation.success) {
      console.error("[BFF LIST] Backend response validation failed:", responseValidation.error.errors)
      // Still return backend data even if validation fails (backend is source of truth)
      return NextResponse.json(backendData, { status: 200 })
    }

    // 6. Return validated response (dates already in ISO string format from backend)
    return NextResponse.json(responseValidation.data, { status: 200 })
  } catch (error) {
    console.error("[BFF] Products list error:", error)
    return NextResponse.json(
      {
        message: "Error interno del servidor",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    )
  }
}
