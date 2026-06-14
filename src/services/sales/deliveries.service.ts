import api from '../../api/axios'
import type { Paginated } from '../common.types'
import type {
  CreateDeliveryDto,
  Delivery,
  OrderDeliverable,
  QueryDeliveryDto,
} from './deliveries.types'

export const deliveriesService = {
  getAll: async (query: QueryDeliveryDto = {}): Promise<Paginated<Delivery>> => {
    const res = await api.get('/deliveries', { params: query })
    return res.data
  },

  getById: async (id: string): Promise<Delivery> => {
    const res = await api.get(`/deliveries/${id}`)
    return res.data
  },

  create: async (dto: CreateDeliveryDto): Promise<Delivery> => {
    const res = await api.post('/deliveries', dto)
    return res.data
  },

  // Dòng hàng còn lại có thể giao của 1 đơn bán
  getOrderDeliverable: async (orderId: string): Promise<OrderDeliverable> => {
    const res = await api.get(`/deliveries/order/${orderId}`)
    return res.data
  },
}
