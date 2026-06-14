import api from '../../api/axios'
import type { CashflowReport, FinanceSummary, IncomeStatement, ReportQuery } from './reports.types'

export const financeReportsService = {
  summary: async (): Promise<FinanceSummary> => {
    const res = await api.get('/finance/summary')
    return res.data
  },

  cashflow: async (query: ReportQuery = {}): Promise<CashflowReport> => {
    const res = await api.get('/finance/reports/cashflow', { params: query })
    return res.data
  },

  incomeStatement: async (query: ReportQuery = {}): Promise<IncomeStatement> => {
    const res = await api.get('/finance/reports/income-statement', { params: query })
    return res.data
  },
}
