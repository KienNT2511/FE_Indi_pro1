import type { Product } from '../products/products.types'
import type { PaymentMethod, PaymentStatus } from '../orders/orders.types'
import type { Supplier } from './suppliers.types'

export const PO_STATUSES = [
  'pending',
  'confirmed',
  'partially_received',
  'received',
  'cancelled',
] as const
export type PurchaseOrderStatus = (typeof PO_STATUSES)[number]

export type PoSortField = 'code' | 'orderDate' | 'total' | 'status' | 'createdAt'

export interface PurchaseOrderItem {
  id: string
  orderId: string
  product: Product | null
  productId: string | null
  productName: string
  unitCost: number
  quantity: number
  receivedQty: number
  lineTotal: number
}

export interface PurchaseOrder {
  id: string
  code: string
  supplier: Supplier
  supplierId: string
  items: PurchaseOrderItem[]
  status: PurchaseOrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  orderDate: string
  expectedDate: string | null
  subtotal: number
  discount: number
  taxRate: number
  taxAmount: number
  shippingFee: number
  total: number
  amountPaid: number
  note: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePurchaseOrderItemDto {
  productId: string
  quantity: number
  unitCost?: number
}

export interface CreatePurchaseOrderDto {
  supplierId: string
  items: CreatePurchaseOrderItemDto[]
  status?: PurchaseOrderStatus
  paymentMethod?: PaymentMethod
  orderDate?: string
  expectedDate?: string
  discount?: number
  taxRate?: number
  shippingFee?: number
  amountPaid?: number
  note?: string
}

export interface UpdatePurchaseOrderDto {
  supplierId?: string
  paymentMethod?: PaymentMethod
  orderDate?: string
  expectedDate?: string
  discount?: number
  taxRate?: number
  shippingFee?: number
  note?: string
}

export interface ReceivePurchaseOrderItemDto {
  itemId: string
  quantity: number
  batchCode?: string
}

export interface ReceivePurchaseOrderDto {
  warehouseId: string
  items: ReceivePurchaseOrderItemDto[]
}

export interface CreateSupplierPaymentDto {
  amount: number
  method?: PaymentMethod
  paymentDate?: string
  note?: string
}

export interface SupplierPayment {
  id: string
  supplierId: string
  purchaseOrderId: string
  amount: number
  method: PaymentMethod
  paymentDate: string
  note: string | null
  createdAt: string
}

export interface QueryPurchaseOrderDto {
  search?: string
  status?: PurchaseOrderStatus
  paymentStatus?: PaymentStatus
  supplierId?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: PoSortField
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// GET /purchase-orders/stats — kiểm soát chi phí mua hàng
export interface PurchaseStats {
  orderCount: number
  totalValue: number
  totalPaid: number
  outstanding: number
  byStatus: Partial<Record<PurchaseOrderStatus, number>>
}

// GET /purchase-orders/debts — công nợ theo nhà cung cấp
export interface SupplierDebt {
  supplierId: string
  supplierName: string
  phone: string | null
  orderCount: number
  totalAmount: number
  paidAmount: number
  outstanding: number
}
