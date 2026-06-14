import type { Customer } from '../customers/customers.types'

// ── Enums (khớp backend) ──────────────────────────────────────────
export const ORDER_STATUSES = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const PAYMENT_METHODS = ['cash', 'bank_transfer', 'card', 'cod'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_STATUSES = ['unpaid', 'partial', 'paid'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export type OrderSortField = 'code' | 'orderDate' | 'total' | 'status' | 'createdAt'

// ── Entities ──────────────────────────────────────────────────────
export interface OrderItem {
  id: string
  orderId: string
  productId: string | null
  productName: string // snapshot tại thời điểm bán
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface Order {
  id: string
  code: string
  customer: Customer
  customerId: string
  items: OrderItem[]
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  orderDate: string
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

// ── DTOs ──────────────────────────────────────────────────────────
export interface CreateOrderItemDto {
  productId: string
  quantity: number
  unitPrice?: number // bỏ trống → backend lấy giá hiện tại của sản phẩm
}

export interface CreateOrderDto {
  customerId: string
  items: CreateOrderItemDto[]
  status?: OrderStatus
  paymentMethod?: PaymentMethod
  orderDate?: string
  discount?: number
  taxRate?: number
  shippingFee?: number
  amountPaid?: number
  note?: string
}

// PATCH /orders/:id — KHÔNG sửa items (đổi hàng thì tạo hóa đơn mới)
export interface UpdateOrderDto {
  customerId?: string
  paymentMethod?: PaymentMethod
  paymentStatus?: PaymentStatus
  orderDate?: string
  discount?: number
  taxRate?: number
  shippingFee?: number
  amountPaid?: number
  note?: string
}

export interface QueryOrderDto {
  search?: string // theo mã hóa đơn
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  customerId?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: OrderSortField
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}
