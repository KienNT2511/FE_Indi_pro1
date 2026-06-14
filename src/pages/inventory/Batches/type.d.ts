import type { Batch, CreateBatchDto } from '../../../services/inventory/batches.types'

export interface BatchFormModalProps {
  open: boolean
  batch: Batch | null // null = tạo mới
  onClose: () => void
  onSubmit: (dto: CreateBatchDto) => Promise<void>
}
