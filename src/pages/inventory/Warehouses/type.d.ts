import type { CreateWarehouseDto, Warehouse } from '../../../services/inventory/warehouses.types'

export interface WarehouseFormModalProps {
  open: boolean
  warehouse: Warehouse | null // null = tạo mới
  onClose: () => void
  onSubmit: (dto: CreateWarehouseDto) => Promise<void>
}
