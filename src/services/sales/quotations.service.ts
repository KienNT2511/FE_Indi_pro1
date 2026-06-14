import api from '../../api/axios'
import type { Paginated } from '../common.types'
import type { Order } from '../orders/orders.types'
import type {
  CreateQuotationDto,
  Quotation,
  QuotationStatus,
  QueryQuotationDto,
} from './quotations.types'

export const quotationsService = {
  getAll: async (query: QueryQuotationDto = {}): Promise<Paginated<Quotation>> => {
    const res = await api.get('/quotations', { params: query })
    return res.data
  },

  getById: async (id: string): Promise<Quotation> => {
    const res = await api.get(`/quotations/${id}`)
    return res.data
  },

  create: async (dto: CreateQuotationDto): Promise<Quotation> => {
    const res = await api.post('/quotations', dto)
    return res.data
  },

  updateStatus: async (id: string, status: QuotationStatus): Promise<Quotation> => {
    const res = await api.patch(`/quotations/${id}/status`, { status })
    return res.data
  },

  // Chuyển báo giá thành đơn bán
  convert: async (id: string): Promise<Order> => {
    const res = await api.post(`/quotations/${id}/convert`)
    return res.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/quotations/${id}`)
  },
}
