import api from '../../api/axios'
import type { Paginated } from '../common.types'
import type {
  CreateWarehouseDto,
  QueryWarehouseDto,
  UpdateWarehouseDto,
  Warehouse,
} from './warehouses.types'

export const warehousesService = {
  getAll: async (query: QueryWarehouseDto = {}): Promise<Paginated<Warehouse>> => {
    const res = await api.get('/warehouses', { params: query })
    return res.data
  },

  getById: async (id: string): Promise<Warehouse> => {
    const res = await api.get(`/warehouses/${id}`)
    return res.data
  },

  create: async (dto: CreateWarehouseDto): Promise<Warehouse> => {
    const res = await api.post('/warehouses', dto)
    return res.data
  },

  update: async (id: string, dto: UpdateWarehouseDto): Promise<Warehouse> => {
    const res = await api.patch(`/warehouses/${id}`, dto)
    return res.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/warehouses/${id}`)
  },
}
