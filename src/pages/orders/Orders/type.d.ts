import type { CreateOrderDto, Order, OrderStatus } from '../../../services/orders/orders.types'

export interface OrderFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (dto: CreateOrderDto) => Promise<void>
}

export interface OrderDetailModalProps {
  open: boolean
  order: Order | null
  onClose: () => void
  onChangeStatus: (status: OrderStatus) => Promise<void>
}

// Dòng sản phẩm tạm trong form (giá trị input dạng chuỗi)
export interface ItemRow {
  key: string
  productId: string
  quantity: string
  unitPrice: string
}
