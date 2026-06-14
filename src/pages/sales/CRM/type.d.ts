import type {
  CreateCustomerInteractionDto,
  CustomerInteraction,
} from '../../../services/sales/interactions.types'

export interface InteractionFormModalProps {
  open: boolean
  interaction: CustomerInteraction | null // null = tạo mới
  onClose: () => void
  onSubmit: (dto: CreateCustomerInteractionDto) => Promise<void>
}
