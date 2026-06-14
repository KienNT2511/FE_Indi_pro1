import type { CustomerDebt, CreateCustomerPaymentDto } from '../../../services/sales/receivables.types'

export interface CollectModalProps {
  open: boolean
  customer: CustomerDebt | null
  onClose: () => void
  onSubmit: (orderId: string, dto: CreateCustomerPaymentDto) => Promise<void>
}
