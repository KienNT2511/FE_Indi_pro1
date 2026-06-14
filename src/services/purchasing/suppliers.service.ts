import api from '../../api/axios'
import type { Paginated } from '../common.types'
import type {
  CreateSupplierDto,
  QuerySupplierDto,
  Supplier,
  UpdateSupplierDto,
} from './suppliers.types'

export const suppliersService = {
  getAll: async (query: QuerySupplierDto = {}): Promise<Paginated<Supplier>> => {
    const res = await api.get('/suppliers', { params: query })
    return res.data
  },

  getById: async (id: string): Promise<Supplier> => {
    const res = await api.get(`/suppliers/${id}`)
    return res.data
  },

  create: async (dto: CreateSupplierDto): Promise<Supplier> => {
    const res = await api.post('/suppliers', dto)
    return res.data
  },

  update: async (id: string, dto: UpdateSupplierDto): Promise<Supplier> => {
    const res = await api.patch(`/suppliers/${id}`, dto)
    return res.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/suppliers/${id}`)
  },
}
