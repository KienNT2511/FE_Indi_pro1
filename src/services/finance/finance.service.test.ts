import { describe, it, expect, vi, beforeEach } from 'vitest'
import { accountsService } from './accounts.service'
import { transactionsService } from './transactions.service'
import { financeReportsService } from './reports.service'
import api from '../../api/axios'

vi.mock('../../api/axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  patch: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

describe('accountsService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('create() POST /finance/accounts', async () => {
    mockedApi.post.mockResolvedValue({ data: { id: 'a1', code: 'QUY' } })
    const dto = { code: 'QUY', name: 'Quỹ TM', type: 'cash' as const, openingBalance: 1000 }
    const res = await accountsService.create(dto)
    expect(mockedApi.post).toHaveBeenCalledWith('/finance/accounts', dto)
    expect(res).toMatchObject({ id: 'a1' })
  })
})

describe('transactionsService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('create() POST /finance/transactions', async () => {
    mockedApi.post.mockResolvedValue({ data: { id: 't1', code: 'PT-1' } })
    const dto = { type: 'receipt' as const, category: 'other_income' as const, accountId: 'a1', amount: 500 }
    const res = await transactionsService.create(dto)
    expect(mockedApi.post).toHaveBeenCalledWith('/finance/transactions', dto)
    expect(res).toMatchObject({ id: 't1' })
  })

  it('getAll() GET /finance/transactions với filter type', async () => {
    const payload = { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }
    mockedApi.get.mockResolvedValue({ data: payload })
    await transactionsService.getAll({ type: 'payment' })
    expect(mockedApi.get).toHaveBeenCalledWith('/finance/transactions', { params: { type: 'payment' } })
  })
})

describe('financeReportsService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('summary() GET /finance/summary', async () => {
    const s = { totalBalance: 1000, accounts: [], receivable: 0, payable: 0, totalIn: 0, totalOut: 0 }
    mockedApi.get.mockResolvedValue({ data: s })
    expect(await financeReportsService.summary()).toEqual(s)
    expect(mockedApi.get).toHaveBeenCalledWith('/finance/summary')
  })

  it('incomeStatement() GET /finance/reports/income-statement với kỳ', async () => {
    const inc = { revenue: 100, purchases: 40, grossProfit: 60, otherIncome: 0, otherExpense: 10, netProfit: 50 }
    mockedApi.get.mockResolvedValue({ data: inc })
    await financeReportsService.incomeStatement({ dateFrom: '2026-01-01' })
    expect(mockedApi.get).toHaveBeenCalledWith('/finance/reports/income-statement', { params: { dateFrom: '2026-01-01' } })
  })
})
