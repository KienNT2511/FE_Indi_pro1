import api from '../../api/axios'
import type { Paginated } from '../common.types'
import type {
  CreateProductionOrderDto,
  ProductionCosting,
  ProductionOrder,
  ProductionOrderStatus,
  ProductionStats,
  QueryProductionOrderDto,
  ReportProductionDto,
} from './productionOrders.types'

export const productionOrdersService = {
  getAll: async (query: QueryProductionOrderDto = {}): Promise<Paginated<ProductionOrder>> => {
    const res = await api.get('/production-orders', { params: query })
    return res.data
  },

  getById: async (id: string): Promise<ProductionOrder> => {
    const res = await api.get(`/production-orders/${id}`)
    return res.data
  },

  create: async (dto: CreateProductionOrderDto): Promise<ProductionOrder> => {
    const res = await api.post('/production-orders', dto)
    return res.data
  },

  updateStatus: async (id: string, status: ProductionOrderStatus): Promise<ProductionOrder> => {
    const res = await api.patch(`/production-orders/${id}/status`, { status })
    return res.data
  },

  // Báo cáo sản xuất (xuất NVL + nhập thành phẩm)
  report: async (id: string, dto: ReportProductionDto): Promise<ProductionOrder> => {
    const res = await api.post(`/production-orders/${id}/report`, dto)
    return res.data
  },

  costing: async (id: string): Promise<ProductionCosting> => {
    const res = await api.get(`/production-orders/${id}/costing`)
    return res.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/production-orders/${id}`)
  },

  stats: async (): Promise<ProductionStats> => {
    const res = await api.get('/production-orders/stats')
    return res.data
  },
}
