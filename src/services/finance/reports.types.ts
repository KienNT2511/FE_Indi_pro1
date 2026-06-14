import type { AccountType } from './accounts.types'
import type { TransactionCategory } from './transactions.types'

export interface SummaryAccount {
  id: string
  code: string
  name: string
  type: AccountType
  currentBalance: number
}

// GET /finance/summary
export interface FinanceSummary {
  totalBalance: number
  accounts: SummaryAccount[]
  receivable: number
  payable: number
  totalIn: number
  totalOut: number
}

export interface CashflowLine {
  category: TransactionCategory
  amount: number
}

// GET /finance/reports/cashflow
export interface CashflowReport {
  totalIn: number
  totalOut: number
  net: number
  inflows: CashflowLine[]
  outflows: CashflowLine[]
}

// GET /finance/reports/income-statement
export interface IncomeStatement {
  revenue: number
  purchases: number
  grossProfit: number
  otherIncome: number
  otherExpense: number
  netProfit: number
}

export interface ReportQuery {
  dateFrom?: string
  dateTo?: string
}
