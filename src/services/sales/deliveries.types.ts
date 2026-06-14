import type { Order } from '../orders/orders.types'
import type { Warehouse } from '../inventory/warehouses.types'

export type DeliverySortField = 'code' | 'deliveryDate' | 'createdAt'

export interface DeliveryItem {
  id: string
  deliveryId: string
  orderItemId: string
  productId: string | null
  productName: string
  quantity: number
}

export interface Delivery {
  id: string
  code: string
  order: Order
  orderId: string
  warehouse: Warehouse
  warehouseId: string
  stockDocCode: string | null
  deliveryDate: string
  note: string | null
  items: DeliveryItem[]
  createdAt: string
}

export interface CreateDeliveryItemDto {
  orderItemId: string
  quantity: number
  batchCode?: string
}

export interface CreateDeliveryDto {
  orderId: string
  warehouseId: string
  items: CreateDeliveryItemDto[]
  deliveryDate?: string
  note?: string
}

export interface QueryDeliveryDto {
  search?: string
  orderId?: string
  warehouseId?: string
  sortBy?: DeliverySortField
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// GET /deliveries/order/:orderId — dòng còn lại có thể giao
export interface DeliverableItem {
  orderItemId: string
  productId: string | null
  productName: string
  ordered: number
  delivered: number
  remaining: number
}

export interface OrderDeliverable {
  orderId: string
  orderCode: string
  customerName: string | null
  status: string
  items: DeliverableItem[]
}
