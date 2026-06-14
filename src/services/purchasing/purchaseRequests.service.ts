import api from '../../api/axios'
import type { Paginated } from '../common.types'
import type { PurchaseOrder } from './purchaseOrders.types'
import type {
  CreatePurchaseRequestDto,
  PurchaseRequest,
  PurchaseRequestStatus,
  QueryPurchaseRequestDto,
} from './purchaseRequests.types'

export const purchaseRequestsService = {
  getAll: async (query: QueryPurchaseRequestDto = {}): Promise<Paginated<PurchaseRequest>> => {
    const res = await api.get('/purchase-requests', { params: query })
    return res.data
  },

  getById: async (id: string): Promise<PurchaseRequest> => {
    const res = await api.get(`/purchase-requests/${id}`)
    return res.data
  },

  create: async (dto: CreatePurchaseRequestDto): Promise<PurchaseRequest> => {
    const res = await api.post('/purchase-requests', dto)
    return res.data
  },

  updateStatus: async (id: string, status: PurchaseRequestStatus): Promise<PurchaseRequest> => {
    const res = await api.patch(`/purchase-requests/${id}/status`, { status })
    return res.data
  },

  // Chuyển đề nghị thành đơn mua (PO) cho 1 nhà cung cấp
  convert: async (id: string, supplierId: string): Promise<PurchaseOrder> => {
    const res = await api.post(`/purchase-requests/${id}/convert`, { supplierId })
    return res.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/purchase-requests/${id}`)
  },
}
