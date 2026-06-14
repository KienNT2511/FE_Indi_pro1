import api from '../../api/axios'
import type { Paginated } from '../common.types'
import type { Order } from '../orders/orders.types'
import type {
  CreateCustomerPaymentDto,
  CustomerDebt,
  CustomerPayment,
  SalesStats,
} from './receivables.types'

export const receivablesService = {
  // Thống kê bán hàng
  stats: async (): Promise<SalesStats> => {
    const res = await api.get('/sales/stats')
    return res.data
  },

  // Công nợ phải thu theo khách hàng
  debts: async (
    query: { search?: string; page?: number; limit?: number } = {},
  ): Promise<Paginated<CustomerDebt>> => {
    const res = await api.get('/sales/debts', { params: query })
    return res.data
  },

  // Thu tiền cho 1 đơn bán
  pay: async (orderId: string, dto: CreateCustomerPaymentDto): Promise<Order> => {
    const res = await api.post(`/sales/orders/${orderId}/payments`, dto)
    return res.data
  },

  getPayments: async (orderId: string): Promise<CustomerPayment[]> => {
    const res = await api.get(`/sales/orders/${orderId}/payments`)
    return res.data
  },
}
