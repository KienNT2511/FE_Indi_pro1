import type { Product } from '../products/products.types'

// Mirror entity backend: modules/inventory/entities/batch.entity.ts
export interface Batch {
  id: string
  code: string
  product?: Product
  productId: string
  manufactureDate: string | null
  expiryDate: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateBatchDto {
  code: string
  productId: string
  manufactureDate?: string
  expiryDate?: string
  note?: string
}

export type UpdateBatchDto = Partial<CreateBatchDto>

export type BatchSortField = 'code' | 'expiryDate' | 'createdAt'

export interface QueryBatchDto {
  search?: string
  productId?: string
  expiringInDays?: number
  sortBy?: BatchSortField
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}
