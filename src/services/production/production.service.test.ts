import { describe, it, expect, vi, beforeEach } from 'vitest'
import { bomsService } from './boms.service'
import { productionOrdersService } from './productionOrders.service'
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

describe('bomsService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('create() POST /boms', async () => {
    mockedApi.post.mockResolvedValue({ data: { id: 'b1', code: 'BOM-1' } })
    const dto = { name: 'BOM A', productId: 'fin1', items: [{ materialProductId: 'm1', quantity: 2 }] }
    const res = await bomsService.create(dto)
    expect(mockedApi.post).toHaveBeenCalledWith('/boms', dto)
    expect(res).toMatchObject({ id: 'b1' })
  })

  it('getAll() GET /boms với productId', async () => {
    const payload = { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }
    mockedApi.get.mockResolvedValue({ data: payload })
    await bomsService.getAll({ productId: 'fin1' })
    expect(mockedApi.get).toHaveBeenCalledWith('/boms', { params: { productId: 'fin1' } })
  })
})

describe('productionOrdersService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('create() POST /production-orders', async () => {
    mockedApi.post.mockResolvedValue({ data: { id: 'mo1', code: 'MO-1' } })
    const dto = { productId: 'fin1', warehouseId: 'wh1', plannedQty: 10 }
    const res = await productionOrdersService.create(dto)
    expect(mockedApi.post).toHaveBeenCalledWith('/production-orders', dto)
    expect(res).toMatchObject({ id: 'mo1' })
  })

  it('report() POST /production-orders/:id/report', async () => {
    mockedApi.post.mockResolvedValue({ data: { id: 'mo1', producedQty: 5, status: 'in_progress' } })
    const res = await productionOrdersService.report('mo1', { quantity: 5 })
    expect(mockedApi.post).toHaveBeenCalledWith('/production-orders/mo1/report', { quantity: 5 })
    expect(res).toMatchObject({ producedQty: 5 })
  })

  it('costing() GET /production-orders/:id/costing', async () => {
    const costing = { plannedQty: 10, producedQty: 0, materials: [], perUnitMaterialCost: 0, laborCost: 0, overheadCost: 0, unitCost: 0, totalPlannedCost: 0 }
    mockedApi.get.mockResolvedValue({ data: costing })
    expect(await productionOrdersService.costing('mo1')).toEqual(costing)
    expect(mockedApi.get).toHaveBeenCalledWith('/production-orders/mo1/costing')
  })

  it('stats() GET /production-orders/stats', async () => {
    const stats = { orderCount: 2, totalPlanned: 20, totalProduced: 5, byStatus: {} }
    mockedApi.get.mockResolvedValue({ data: stats })
    expect(await productionOrdersService.stats()).toEqual(stats)
    expect(mockedApi.get).toHaveBeenCalledWith('/production-orders/stats')
  })
})
