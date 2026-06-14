import type { Product } from '../products/products.types'
import type { Warehouse } from './warehouses.types'
import type { Batch } from './batches.types'

// ── Tồn kho chi tiết (stock_levels) ───────────────────────────────
export interface StockLevel {
  id: string
  product: Product
  productId: string
  warehouse: Warehouse
  warehouseId: string
  batch: Batch | null
  batchId: string | null
  quantity: number
  updatedAt: string
}

export interface QueryStockLevelDto {
  search?: string
  warehouseId?: string
  productId?: string
  onlyInStock?: 'true' | 'false'
  page?: number
  limit?: number
}

// ── Thẻ kho (stock_movements) ─────────────────────────────────────
export const MOVEMENT_TYPES = [
  'receipt',
  'issue',
  'transfer_in',
  'transfer_out',
  'adjust',
] as const
export type MovementType = (typeof MOVEMENT_TYPES)[number]

export interface StockMovement {
  id: string
  type: MovementType
  product: Product | null
  productId: string | null
  warehouse: Warehouse | null
  warehouseId: string | null
  batchId: string | null
  quantityChange: number
  balanceAfter: number
  docId: string | null
  docCode: string | null
  note: string | null
  createdAt: string
}

export interface QueryMovementDto {
  productId?: string
  warehouseId?: string
  type?: MovementType
  dateFrom?: string
  dateTo?: string
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// ── Cảnh báo tồn kho — trả về Product ─────────────────────────────
export interface QueryLowStockDto {
  search?: string
  page?: number
  limit?: number
}
