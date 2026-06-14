import type { Product } from '../products/products.types'

export const PR_STATUSES = ['draft', 'submitted', 'approved', 'rejected', 'converted'] as const
export type PurchaseRequestStatus = (typeof PR_STATUSES)[number]

export type PrSortField = 'code' | 'requestDate' | 'createdAt'

export interface PurchaseRequestItem {
  id: string
  requestId: string
  product: Product | null
  productId: string | null
  productName: string
  quantity: number
  note: string | null
}

export interface PurchaseRequest {
  id: string
  code: string
  status: PurchaseRequestStatus
  requestedBy: string | null
  requestDate: string
  note: string | null
  purchaseOrderId: string | null
  items: PurchaseRequestItem[]
  createdAt: string
  updatedAt: string
}

export interface CreatePurchaseRequestItemDto {
  productId: string
  quantity: number
  note?: string
}

export interface CreatePurchaseRequestDto {
  requestedBy?: string
  requestDate?: string
  note?: string
  items: CreatePurchaseRequestItemDto[]
}

export interface QueryPurchaseRequestDto {
  search?: string
  status?: PurchaseRequestStatus
  sortBy?: PrSortField
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}
