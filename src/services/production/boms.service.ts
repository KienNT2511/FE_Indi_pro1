import api from '../../api/axios'
import type { Paginated } from '../common.types'
import type { BillOfMaterials, CreateBomDto, QueryBomDto, UpdateBomDto } from './boms.types'

export const bomsService = {
  getAll: async (query: QueryBomDto = {}): Promise<Paginated<BillOfMaterials>> => {
    const res = await api.get('/boms', { params: query })
    return res.data
  },

  getById: async (id: string): Promise<BillOfMaterials> => {
    const res = await api.get(`/boms/${id}`)
    return res.data
  },

  create: async (dto: CreateBomDto): Promise<BillOfMaterials> => {
    const res = await api.post('/boms', dto)
    return res.data
  },

  update: async (id: string, dto: UpdateBomDto): Promise<BillOfMaterials> => {
    const res = await api.patch(`/boms/${id}`, dto)
    return res.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/boms/${id}`)
  },
}
