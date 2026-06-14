import type { BillOfMaterials, CreateBomDto } from '../../../services/production/boms.types'

export interface BomFormModalProps {
  open: boolean
  bom: BillOfMaterials | null // null = tạo mới
  onClose: () => void
  onSubmit: (dto: CreateBomDto) => Promise<void>
}

export interface BomItemRow {
  key: string
  materialProductId: string
  quantity: string
}
