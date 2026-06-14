import api from '../../api/axios'
import type { Paginated } from '../common.types'
import type { CreateCustomerDto, Customer, QueryCustomerDto, UpdateCustomerDto } from './customers.types'

export const customersService = {
  // GET /customers — danh sách + phân trang, tìm theo tên/SĐT/email
  getAll: async (query: QueryCustomerDto = {}): Promise<Paginated<Customer>> => {
    const res = await api.get('/customers', { params: query })
    return res.data
  },

  // GET /customers/:id
  getById: async (id: string): Promise<Customer> => {
    const res = await api.get(`/customers/${id}`)
    return res.data
  },

  // POST /customers
  create: async (dto: CreateCustomerDto): Promise<Customer> => {
    const res = await api.post('/customers', dto)
    return res.data
  },

  // PATCH /customers/:id
  update: async (id: string, dto: UpdateCustomerDto): Promise<Customer> => {
    const res = await api.patch(`/customers/${id}`, dto)
    return res.data
  },

  // DELETE /customers/:id (204)
  remove: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`)
  },
}
