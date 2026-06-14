import type { FinancialAccount } from './accounts.types'

export const TRANSACTION_TYPES = ['receipt', 'payment'] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]

export const TRANSACTION_CATEGORIES = [
  'sales',
  'other_income',
  'capital',
  'purchase',
  'salary',
  'rent',
  'utilities',
  'tax',
  'other_expense',
] as const
export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number]

// Hạng mục theo loại phiếu (gợi ý cho form)
export const RECEIPT_CATEGORIES: TransactionCategory[] = ['sales', 'other_income', 'capital']
export const PAYMENT_CATEGORIES: TransactionCategory[] = [
  'purchase',
  'salary',
  'rent',
  'utilities',
  'tax',
  'other_expense',
]

export type TransactionSortField = 'code' | 'date' | 'amount' | 'createdAt'

export interface Transaction {
  id: string
  code: string
  type: TransactionType
  category: TransactionCategory
  account: FinancialAccount
  accountId: string
  amount: number
  partnerName: string | null
  refType: string | null
  refCode: string | null
  date: string
  note: string | null
  createdAt: string
}

export interface CreateTransactionDto {
  type: TransactionType
  category: TransactionCategory
  accountId: string
  amount: number
  partnerName?: string
  refType?: string
  refCode?: string
  date?: string
  note?: string
}

export interface QueryTransactionDto {
  search?: string
  type?: TransactionType
  category?: TransactionCategory
  accountId?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: TransactionSortField
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}
