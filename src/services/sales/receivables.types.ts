import type { PaymentMethod, OrderStatus } from '../orders/orders.types'

export interface CreateCustomerPaymentDto {
  amount: number
  method?: PaymentMethod
  paymentDate?: string
  note?: string
}

export interface CustomerPayment {
  id: string
  customerId: string
  orderId: string
  amount: number
  method: PaymentMethod
  paymentDate: string
  note: string | null
  createdAt: string
}

// GET /sales/stats — thống kê bán hàng
export interface SalesStats {
  orderCount: number
  revenue: number
  collected: number
  outstanding: number
  byStatus: Partial<Record<OrderStatus, number>>
}

// GET /sales/debts — công nợ theo khách hàng
export interface CustomerDebt {
  customerId: string
  customerName: string
  phone: string | null
  orderCount: number
  totalAmount: number
  paidAmount: number
  outstanding: number
}
