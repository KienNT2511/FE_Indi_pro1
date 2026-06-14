import api from '../../api/axios'
import type { Paginated } from '../common.types'
import type {
  CreateCustomerInteractionDto,
  CustomerInteraction,
  QueryCustomerInteractionDto,
  UpdateCustomerInteractionDto,
} from './interactions.types'

export const interactionsService = {
  getAll: async (query: QueryCustomerInteractionDto = {}): Promise<Paginated<CustomerInteraction>> => {
    const res = await api.get('/customer-interactions', { params: query })
    return res.data
  },

  create: async (dto: CreateCustomerInteractionDto): Promise<CustomerInteraction> => {
    const res = await api.post('/customer-interactions', dto)
    return res.data
  },

  update: async (id: string, dto: UpdateCustomerInteractionDto): Promise<CustomerInteraction> => {
    const res = await api.patch(`/customer-interactions/${id}`, dto)
    return res.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/customer-interactions/${id}`)
  },
}
