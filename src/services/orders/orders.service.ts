import api from '../../api/axios'
import type { Paginated } from '../common.types'
import type {
  CreateOrderDto,
  Order,
  OrderStatus,
  QueryOrderDto,
  UpdateOrderDto,
} from './orders.types'

export const ordersService = {
  // GET /orders — danh sách + filter + phân trang + sort (server)
  getAll: async (query: QueryOrderDto = {}): Promise<Paginated<Order>> => {
    const res = await api.get('/orders', { params: query })
    return res.data
  },

  // GET /orders/:id — chi tiết hóa đơn kèm items + customer
  getById: async (id: string): Promise<Order> => {
    const res = await api.get(`/orders/${id}`)
    return res.data
  },

  // POST /orders — tạo hóa đơn (trừ tồn kho + tính tiền trong transaction)
  create: async (dto: CreateOrderDto): Promise<Order> => {
    const res = await api.post('/orders', dto)
    return res.data
  },

  // PATCH /orders/:id — cập nhật thông tin hóa đơn (không sửa dòng hàng)
  update: async (id: string, dto: UpdateOrderDto): Promise<Order> => {
    const res = await api.patch(`/orders/${id}`, dto)
    return res.data
  },

  // PATCH /orders/:id/status — đổi trạng thái; hủy → hoàn tồn kho
  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const res = await api.patch(`/orders/${id}/status`, { status })
    return res.data
  },

  // DELETE /orders/:id (204) — hoàn tồn kho nếu chưa hủy
  remove: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`)
  },
}
