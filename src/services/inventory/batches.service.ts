import api from '../../api/axios'
import type { Paginated } from '../common.types'
import type { Batch, CreateBatchDto, QueryBatchDto, UpdateBatchDto } from './batches.types'

export const batchesService = {
  getAll: async (query: QueryBatchDto = {}): Promise<Paginated<Batch>> => {
    const res = await api.get('/batches', { params: query })
    return res.data
  },

  getById: async (id: string): Promise<Batch> => {
    const res = await api.get(`/batches/${id}`)
    return res.data
  },

  create: async (dto: CreateBatchDto): Promise<Batch> => {
    const res = await api.post('/batches', dto)
    return res.data
  },

  update: async (id: string, dto: UpdateBatchDto): Promise<Batch> => {
    const res = await api.patch(`/batches/${id}`, dto)
    return res.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/batches/${id}`)
  },
}
