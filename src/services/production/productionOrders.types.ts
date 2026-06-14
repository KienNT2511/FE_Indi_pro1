import type { Product } from '../products/products.types'
import type { Warehouse } from '../inventory/warehouses.types'
import type { BillOfMaterials } from './boms.types'

export const PRODUCTION_STATUSES = ['planned', 'in_progress', 'completed', 'cancelled'] as const
export type ProductionOrderStatus = (typeof PRODUCTION_STATUSES)[number]

export type MoSortField = 'code' | 'dueDate' | 'createdAt'

export interface ProductionEntry {
  id: string
  orderId: string
  quantity: number
  materialCost: number
  entryDate: string
  issueDocCode: string | null
  receiptDocCode: string | null
  note: string | null
  createdAt: string
}

export interface ProductionOrder {
  id: string
  code: string
  product: Product
  productId: string
  bom: BillOfMaterials | null
  bomId: string | null
  warehouse: Warehouse
  warehouseId: string
  plannedQty: number
  producedQty: number
  status: ProductionOrderStatus
  startDate: string | null
  dueDate: string | null
  laborCost: number
  overheadCost: number
  note: string | null
  entries: ProductionEntry[]
  createdAt: string
  updatedAt: string
}

export interface CreateProductionOrderDto {
  productId: string
  bomId?: string
  warehouseId: string
  plannedQty: number
  startDate?: string
  dueDate?: string
  laborCost?: number
  overheadCost?: number
  note?: string
}

export interface ReportProductionDto {
  quantity: number
  entryDate?: string
  note?: string
}

export interface QueryProductionOrderDto {
  search?: string
  status?: ProductionOrderStatus
  productId?: string
  sortBy?: MoSortField
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// GET /production-orders/:id/costing
export interface CostingMaterial {
  materialName: string
  qtyPerUnit: number
  unitCost: number
  lineCost: number
}

export interface ProductionCosting {
  plannedQty: number
  producedQty: number
  materials: CostingMaterial[]
  perUnitMaterialCost: number
  laborCost: number
  overheadCost: number
  unitCost: number
  totalPlannedCost: number
}

// GET /production-orders/stats
export interface ProductionStats {
  orderCount: number
  totalPlanned: number
  totalProduced: number
  byStatus: Partial<Record<ProductionOrderStatus, number>>
}
