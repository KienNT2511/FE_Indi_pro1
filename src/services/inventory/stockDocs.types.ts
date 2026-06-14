import type { Product } from '../products/products.types'
import type { Warehouse } from './warehouses.types'
import type { Batch } from './batches.types'

// ── Enums (khớp backend) ──────────────────────────────────────────
export const STOCK_DOC_TYPES = ['receipt', 'issue', 'transfer', 'count'] as const
export type StockDocType = (typeof STOCK_DOC_TYPES)[number]

export const STOCK_DOC_STATUSES = ['posted', 'cancelled'] as const
export type StockDocStatus = (typeof STOCK_DOC_STATUSES)[number]

export type StockDocSortField = 'code' | 'date' | 'createdAt'

// ── Entities ──────────────────────────────────────────────────────
export interface StockDocItem {
  id: string
  docId: string
  product: Product | null
  productId: string | null
  productName: string
  batch: Batch | null
  batchId: string | null
  batchCode: string | null
  quantity: number
  systemQty: number | null // chỉ có với kiểm kê
  note: string | null
}

export interface StockDoc {
  id: string
  code: string
  type: StockDocType
  status: StockDocStatus
  warehouse: Warehouse
  warehouseId: string
  counterWarehouse: Warehouse | null
  counterWarehouseId: string | null
  partnerName: string | null
  reason: string | null
  date: string
  note: string | null
  items: StockDocItem[]
  createdAt: string
  updatedAt: string
}

// ── DTOs ──────────────────────────────────────────────────────────
export interface CreateStockDocItemDto {
  productId: string
  batchId?: string
  batchCode?: string
  quantity: number
  note?: string
}

export interface CreateStockDocDto {
  type: StockDocType
  warehouseId: string
  counterWarehouseId?: string
  partnerName?: string
  reason?: string
  date?: string
  note?: string
  items: CreateStockDocItemDto[]
}

export interface QueryStockDocDto {
  search?: string
  type?: StockDocType
  status?: StockDocStatus
  warehouseId?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: StockDocSortField
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}
