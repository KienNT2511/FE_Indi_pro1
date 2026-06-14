import type {
  CreateQuotationDto,
  Quotation,
  QuotationStatus,
} from '../../../services/sales/quotations.types'

export interface QuotationFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (dto: CreateQuotationDto) => Promise<void>
}

export interface QuotationDetailModalProps {
  open: boolean
  quotation: Quotation | null
  onClose: () => void
  onChangeStatus: (status: QuotationStatus) => Promise<void>
  onConvert: () => Promise<void>
}

export interface QuoteItemRow {
  key: string
  productId: string
  quantity: string
  unitPrice: string
}
