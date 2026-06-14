import type { CreateAccountDto, FinancialAccount } from '../../../services/finance/accounts.types'

export interface AccountFormModalProps {
  open: boolean
  account: FinancialAccount | null // null = tạo mới
  onClose: () => void
  onSubmit: (dto: CreateAccountDto) => Promise<void>
}
