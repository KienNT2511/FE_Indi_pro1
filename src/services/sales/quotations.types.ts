import type { Product } from '../products/products.types'
import type { Customer } from '../customers/customers.types'

export const QUOTATION_STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'converted'] as const
export type QuotationStatus = (typeof QUOTATION_STATUSES)[number]

export type QuotationSortField = 'code' | 'quoteDate' | 'total' | 'createdAt'

export interface QuotationItem {
  id: string
  quotationId: string
  product: Product | null
  productId: string | null
  productName: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface Quotation {
  id: string
  code: string
  customer: Customer
  customerId: string
  status: QuotationStatus
  quoteDate: string
  validUntil: string | null
  subtotal: number
  discount: number
  taxRate: number
  taxAmount: number
  total: number
  note: string | null
  orderId: string | null
  items: QuotationItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateQuotationItemDto {
  productId: string
  quantity: number
  unitPrice?: number
}

export interface CreateQuotationDto {
  customerId: string
  items: CreateQuotationItemDto[]
  quoteDate?: string
  validUntil?: string
  discount?: number
  taxRate?: number
  note?: string
}

export interface QueryQuotationDto {
  search?: string
  status?: QuotationStatus
  customerId?: string
  sortBy?: QuotationSortField
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}
