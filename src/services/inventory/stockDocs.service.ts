import api from '../../api/axios'
import type { Paginated } from '../common.types'
import type { CreateStockDocDto, QueryStockDocDto, StockDoc } from './stockDocs.types'

export const stockDocsService = {
  // GET /stock-docs — danh sách chứng từ (lọc theo type/status/kho/ngày)
  getAll: async (query: QueryStockDocDto = {}): Promise<Paginated<StockDoc>> => {
    const res = await api.get('/stock-docs', { params: query })
    return res.data
  },

  getById: async (id: string): Promise<StockDoc> => {
    const res = await api.get(`/stock-docs/${id}`)
    return res.data
  },

  // POST /stock-docs — tạo + post chứng từ (cập nhật tồn ngay)
  create: async (dto: CreateStockDocDto): Promise<StockDoc> => {
    const res = await api.post('/stock-docs', dto)
    return res.data
  },

  // POST /stock-docs/:id/cancel — huỷ chứng từ, hoàn tồn kho
  cancel: async (id: string): Promise<StockDoc> => {
    const res = await api.post(`/stock-docs/${id}/cancel`)
    return res.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/stock-docs/${id}`)
  },
}
