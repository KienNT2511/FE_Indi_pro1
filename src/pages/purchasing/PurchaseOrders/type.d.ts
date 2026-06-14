import type {
  CreatePurchaseOrderDto,
  CreateSupplierPaymentDto,
  PurchaseOrder,
  ReceivePurchaseOrderDto,
  SupplierPayment,
} from '../../../services/purchasing/purchaseOrders.types'

export interface PoFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (dto: CreatePurchaseOrderDto) => Promise<void>
}

export interface PoDetailModalProps {
  open: boolean
  order: PurchaseOrder | null
  payments: SupplierPayment[]
  onClose: () => void
  onReceive: () => void
  onPay: () => void
  onCancelOrder: () => Promise<void>
}

export interface ReceiveModalProps {
  open: boolean
  order: PurchaseOrder | null
  onClose: () => void
  onSubmit: (dto: ReceivePurchaseOrderDto) => Promise<void>
}

export interface PayModalProps {
  open: boolean
  order: PurchaseOrder | null
  onClose: () => void
  onSubmit: (dto: CreateSupplierPaymentDto) => Promise<void>
}

// Dòng tạm trong form tạo PO
export interface PoItemRow {
  key: string
  productId: string
  quantity: string
  unitCost: string
}

// Dòng tạm khi nhập hàng
export interface ReceiveRow {
  itemId: string
  productName: string
  remaining: number
  quantity: string
  batchCode: string
}
