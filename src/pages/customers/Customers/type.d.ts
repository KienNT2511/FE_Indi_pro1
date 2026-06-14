import type { CreateCustomerDto, Customer } from '../../../services/customers/customers.types'

export interface CustomerFormModalProps {
  open: boolean
  customer: Customer | null // null = tạo mới
  onClose: () => void
  onSubmit: (dto: CreateCustomerDto) => Promise<void>
}
