import { describe, it, expect, vi, beforeEach } from 'vitest'
import { quotationsService } from './quotations.service'
import { deliveriesService } from './deliveries.service'
import { receivablesService } from './receivables.service'
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

describe('quotationsService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('create() POST /quotations', async () => {
    mockedApi.post.mockResolvedValue({ data: { id: 'q1', code: 'QUO-1' } })
    const res = await quotationsService.create({ customerId: 'c1', items: [{ productId: 'p1', quantity: 1 }] })
    expect(mockedApi.post).toHaveBeenCalledWith('/quotations', {
      customerId: 'c1',
      items: [{ productId: 'p1', quantity: 1 }],
    })
    expect(res).toMatchObject({ id: 'q1' })
  })

  it('convert() POST /quotations/:id/convert', async () => {
    mockedApi.post.mockResolvedValue({ data: { id: 'ord1' } })
    const res = await quotationsService.convert('q1')
    expect(mockedApi.post).toHaveBeenCalledWith('/quotations/q1/convert')
    expect(res).toMatchObject({ id: 'ord1' })
  })

  it('updateStatus() PATCH /quotations/:id/status', async () => {
    mockedApi.patch.mockResolvedValue({ data: { id: 'q1', status: 'sent' } })
    await quotationsService.updateStatus('q1', 'sent')
    expect(mockedApi.patch).toHaveBeenCalledWith('/quotations/q1/status', { status: 'sent' })
  })
})

describe('deliveriesService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('create() POST /deliveries', async () => {
    mockedApi.post.mockResolvedValue({ data: { id: 'dlv1' } })
    const dto = { orderId: 'o1', warehouseId: 'wh1', items: [{ orderItemId: 'oi1', quantity: 3 }] }
    const res = await deliveriesService.create(dto)
    expect(mockedApi.post).toHaveBeenCalledWith('/deliveries', dto)
    expect(res).toMatchObject({ id: 'dlv1' })
  })

  it('getOrderDeliverable() GET /deliveries/order/:id', async () => {
    mockedApi.get.mockResolvedValue({ data: { orderId: 'o1', items: [] } })
    const res = await deliveriesService.getOrderDeliverable('o1')
    expect(mockedApi.get).toHaveBeenCalledWith('/deliveries/order/o1')
    expect(res).toMatchObject({ orderId: 'o1' })
  })
})

describe('receivablesService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('pay() POST /sales/orders/:id/payments', async () => {
    mockedApi.post.mockResolvedValue({ data: { id: 'o1', paymentStatus: 'paid' } })
    const res = await receivablesService.pay('o1', { amount: 1000 })
    expect(mockedApi.post).toHaveBeenCalledWith('/sales/orders/o1/payments', { amount: 1000 })
    expect(res).toMatchObject({ paymentStatus: 'paid' })
  })

  it('stats() GET /sales/stats', async () => {
    const stats = { orderCount: 2, revenue: 100, collected: 30, outstanding: 70, byStatus: {} }
    mockedApi.get.mockResolvedValue({ data: stats })
    expect(await receivablesService.stats()).toEqual(stats)
    expect(mockedApi.get).toHaveBeenCalledWith('/sales/stats')
  })

  it('debts() GET /sales/debts', async () => {
    const payload = { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }
    mockedApi.get.mockResolvedValue({ data: payload })
    expect(await receivablesService.debts({ search: 'x' })).toEqual(payload)
    expect(mockedApi.get).toHaveBeenCalledWith('/sales/debts', { params: { search: 'x' } })
  })
})
