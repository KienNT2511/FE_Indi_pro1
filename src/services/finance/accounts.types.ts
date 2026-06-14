export const ACCOUNT_TYPES = ['cash', 'bank'] as const
export type AccountType = (typeof ACCOUNT_TYPES)[number]

export type AccountSortField = 'code' | 'name' | 'createdAt'

export interface FinancialAccount {
  id: string
  code: string
  name: string
  type: AccountType
  bankName: string | null
  accountNumber: string | null
  openingBalance: number
  currentBalance: number
  isActive: boolean
  note: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateAccountDto {
  code: string
  name: string
  type: AccountType
  bankName?: string
  accountNumber?: string
  openingBalance?: number
  isActive?: boolean
  note?: string
}

export type UpdateAccountDto = Partial<CreateAccountDto>

export interface QueryAccountDto {
  search?: string
  type?: AccountType
  sortBy?: AccountSortField
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}
