import type { CreateProductDto, Product } from '../../../services/products/products.types'

export interface ProductFormModalProps {
  open: boolean
  product: Product | null // null = chế độ tạo mới, có giá trị = chế độ chỉnh sửa
  onClose: () => void
  // Trả về promise; throw nếu lỗi để modal hiển thị Alert
  onSubmit: (dto: CreateProductDto) => Promise<void>
}

export interface ImportModalProps {
  open: boolean
  onClose: () => void
  onUploaded: () => void
}
