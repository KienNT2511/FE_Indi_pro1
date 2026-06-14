import type { CreateTransactionDto, TransactionType } from '../../../services/finance/transactions.types'

export interface TransactionFormModalProps {
  open: boolean
  type: TransactionType
  onClose: () => void
  onSubmit: (dto: CreateTransactionDto) => Promise<void>
}
