import type { CreateDeliveryDto, Delivery } from '../../../services/sales/deliveries.types'

export interface DeliveryFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (dto: CreateDeliveryDto) => Promise<void>
}

export interface DeliveryDetailModalProps {
  open: boolean
  delivery: Delivery | null
  onClose: () => void
}

// Dòng tạm trong form xuất hàng
export interface DeliverRow {
  orderItemId: string
  productName: string
  ordered: number
  delivered: number
  remaining: number
  quantity: string
  batchCode: string
}
