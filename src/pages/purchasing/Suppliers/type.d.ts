import type { CreateSupplierDto, Supplier } from '../../../services/purchasing/suppliers.types'

export interface SupplierFormModalProps {
  open: boolean
  supplier: Supplier | null // null = tạo mới
  onClose: () => void
  onSubmit: (dto: CreateSupplierDto) => Promise<void>
}
