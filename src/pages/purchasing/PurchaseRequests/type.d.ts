import type {
  CreatePurchaseRequestDto,
  PurchaseRequest,
  PurchaseRequestStatus,
} from '../../../services/purchasing/purchaseRequests.types'

export interface PrFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (dto: CreatePurchaseRequestDto) => Promise<void>
}

export interface PrDetailModalProps {
  open: boolean
  request: PurchaseRequest | null
  onClose: () => void
  onChangeStatus: (status: PurchaseRequestStatus) => Promise<void>
  onConvert: (supplierId: string) => Promise<void>
}

// Dòng tạm trong form (input dạng chuỗi)
export interface PrItemRow {
  key: string
  productId: string
  quantity: string
}
