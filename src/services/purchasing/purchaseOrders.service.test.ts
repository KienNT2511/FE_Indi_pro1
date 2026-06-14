import { describe, it, expect, vi, beforeEach } from 'vitest'
import { purchaseOrdersService } from './purchaseOrders.service'
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

describe('purchaseOrdersService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('create() gọi POST /purchase-orders', async () => {
    mockedApi.post.mockResolvedValue({ data: { id: 'po1', code: 'PO-1' } })
    const res = await purchaseOrdersService.create({
      supplierId: 'sup1',
      items: [{ productId: 'p1', quantity: 2, unitCost: 1000 }],
    })
    expect(mockedApi.post).toHaveBeenCalledWith('/purchase-orders', {
      supplierId: 'sup1',
      items: [{ productId: 'p1', quantity: 2, unitCost: 1000 }],
    })
    expect(res).toMatchObject({ id: 'po1' })
  })

  it('receive() gọi POST /purchase-orders/:id/receive', async () => {
    mockedApi.post.mockResolvedValue({ data: { id: 'po1', status: 'received' } })
    const dto = { warehouseId: 'wh1', items: [{ itemId: 'i1', quantity: 5 }] }
    const res = await purchaseOrdersService.receive('po1', dto)
    expect(mockedApi.post).toHaveBeenCalledWith('/purchase-orders/po1/receive', dto)
    expect(res).toMatchObject({ status: 'received' })
  })

  it('pay() gọi POST /purchase-orders/:id/payments', async () => {
    mockedApi.post.mockResolvedValue({ data: { id: 'po1', paymentStatus: 'paid' } })
    const res = await purchaseOrdersService.pay('po1', { amount: 2200 })
    expect(mockedApi.post).toHaveBeenCalledWith('/purchase-orders/po1/payments', { amount: 2200 })
    expect(res).toMatchObject({ paymentStatus: 'paid' })
  })

  it('stats() gọi GET /purchase-orders/stats', async () => {
    const stats = { orderCount: 3, totalValue: 100, totalPaid: 40, outstanding: 60, byStatus: {} }
    mockedApi.get.mockResolvedValue({ data: stats })
    const res = await purchaseOrdersService.stats()
    expect(mockedApi.get).toHaveBeenCalledWith('/purchase-orders/stats')
    expect(res).toEqual(stats)
  })

  it('debts() gọi GET /purchase-orders/debts kèm query', async () => {
    const payload = { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }
    mockedApi.get.mockResolvedValue({ data: payload })
    const res = await purchaseOrdersService.debts({ search: 'A' })
    expect(mockedApi.get).toHaveBeenCalledWith('/purchase-orders/debts', { params: { search: 'A' } })
    expect(res).toEqual(payload)
  })
})
