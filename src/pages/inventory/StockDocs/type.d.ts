import type {
  CreateStockDocDto,
  StockDoc,
  StockDocType,
} from '../../../services/inventory/stockDocs.types'

export interface StockDocsPageProps {
  docType: StockDocType
}

export interface StockDocFormModalProps {
  open: boolean
  docType: StockDocType
  onClose: () => void
  onSubmit: (dto: CreateStockDocDto) => Promise<void>
}

export interface StockDocDetailModalProps {
  open: boolean
  doc: StockDoc | null
  onClose: () => void
  onCancelDoc: () => Promise<void>
}

// Dòng hàng tạm trong form (input dạng chuỗi)
export interface DocItemRow {
  key: string
  productId: string
  batchCode: string
  quantity: string
}
