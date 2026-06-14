import api from '../../api/axios'
import type { Paginated } from '../common.types'
import type {
  CreatePurchaseOrderDto,
  CreateSupplierPaymentDto,
  PurchaseOrder,
  PurchaseOrderStatus,
  PurchaseStats,
  QueryPurchaseOrderDto,
  ReceivePurchaseOrderDto,
  SupplierDebt,
  SupplierPayment,
  UpdatePurchaseOrderDto,
} from './purchaseOrders.types'

export const purchaseOrdersService = {
  getAll: async (query: QueryPurchaseOrderDto = {}): Promise<Paginated<PurchaseOrder>> => {
    const res = await api.get('/purchase-orders', { params: query })
    return res.data
  },

  getById: async (id: string): Promise<PurchaseOrder> => {
    const res = await api.get(`/purchase-orders/${id}`)
    return res.data
  },

  create: async (dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> => {
    const res = await api.post('/purchase-orders', dto)
    return res.data
  },

  update: async (id: string, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> => {
    const res = await api.patch(`/purchase-orders/${id}`, dto)
    return res.data
  },

  updateStatus: async (id: string, status: PurchaseOrderStatus): Promise<PurchaseOrder> => {
    const res = await api.patch(`/purchase-orders/${id}/status`, { status })
    return res.data
  },

  // Nhập hàng từ PO vào kho
  receive: async (id: string, dto: ReceivePurchaseOrderDto): Promise<PurchaseOrder> => {
    const res = await api.post(`/purchase-orders/${id}/receive`, dto)
    return res.data
  },

  // Ghi nhận thanh toán cho NCC
  pay: async (id: string, dto: CreateSupplierPaymentDto): Promise<PurchaseOrder> => {
    const res = await api.post(`/purchase-orders/${id}/payments`, dto)
    return res.data
  },

  getPayments: async (id: string): Promise<SupplierPayment[]> => {
    const res = await api.get(`/purchase-orders/${id}/payments`)
    return res.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/purchase-orders/${id}`)
  },

  // Kiểm soát chi phí mua hàng
  stats: async (): Promise<PurchaseStats> => {
    const res = await api.get('/purchase-orders/stats')
    return res.data
  },

  // Công nợ nhà cung cấp
  debts: async (
    query: { search?: string; page?: number; limit?: number } = {},
  ): Promise<Paginated<SupplierDebt>> => {
    const res = await api.get('/purchase-orders/debts', { params: query })
    return res.data
  },
}
