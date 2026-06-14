import api from '../../api/axios'
import type { Paginated } from '../common.types'
import type {
  CreateTransactionDto,
  QueryTransactionDto,
  Transaction,
} from './transactions.types'

export const transactionsService = {
  getAll: async (query: QueryTransactionDto = {}): Promise<Paginated<Transaction>> => {
    const res = await api.get('/finance/transactions', { params: query })
    return res.data
  },

  getById: async (id: string): Promise<Transaction> => {
    const res = await api.get(`/finance/transactions/${id}`)
    return res.data
  },

  create: async (dto: CreateTransactionDto): Promise<Transaction> => {
    const res = await api.post('/finance/transactions', dto)
    return res.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/finance/transactions/${id}`)
  },
}
