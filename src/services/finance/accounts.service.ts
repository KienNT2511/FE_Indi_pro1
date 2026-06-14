import api from '../../api/axios'
import type { Paginated } from '../common.types'
import type {
  CreateAccountDto,
  FinancialAccount,
  QueryAccountDto,
  UpdateAccountDto,
} from './accounts.types'

export const accountsService = {
  getAll: async (query: QueryAccountDto = {}): Promise<Paginated<FinancialAccount>> => {
    const res = await api.get('/finance/accounts', { params: query })
    return res.data
  },

  getById: async (id: string): Promise<FinancialAccount> => {
    const res = await api.get(`/finance/accounts/${id}`)
    return res.data
  },

  create: async (dto: CreateAccountDto): Promise<FinancialAccount> => {
    const res = await api.post('/finance/accounts', dto)
    return res.data
  },

  update: async (id: string, dto: UpdateAccountDto): Promise<FinancialAccount> => {
    const res = await api.patch(`/finance/accounts/${id}`, dto)
    return res.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/finance/accounts/${id}`)
  },
}
