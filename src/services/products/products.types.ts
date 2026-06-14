// Mirror entity backend: src/modules/products/entities/product.entity.ts
export interface Product {
  id: string
  name: string
  price: number
  cost: number
  quantity: number
  minStock: number
  unit: string | null
  material: string | null
  category: string
  createdAt: string
  updatedAt: string
}

// Mirror CreateProductDto backend
export interface CreateProductDto {
  name: string
  price: number
  cost?: number
  quantity: number
  minStock?: number
  unit?: string
  material?: string
  category: string
}

// Mirror UpdateProductDto (PartialType của CreateProductDto)
export type UpdateProductDto = Partial<CreateProductDto>

// Các cột cho phép sắp xếp (khớp whitelist của backend)
export type ProductSortField = 'name' | 'price' | 'quantity' | 'category' | 'createdAt'

// Mirror QueryProductDto backend
export interface QueryProductDto {
  search?: string
  category?: string
  sortBy?: ProductSortField
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

// GET /products trả về { data, meta }
export interface PaginatedProducts {
  data: Product[]
  meta: PaginationMeta
}

// POST /products/upload trả về kết quả import
export interface ImportError {
  row: number
  reason: string
}

export interface ImportResult {
  inserted: number
  failed: number
  errors: ImportError[]
}
