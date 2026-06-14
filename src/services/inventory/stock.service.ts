import api from '../../api/axios'
import type { Paginated } from '../common.types'
import type { Product } from '../products/products.types'
import type {
  QueryLowStockDto,
  QueryMovementDto,
  QueryStockLevelDto,
  StockLevel,
  StockMovement,
} from './stock.types'

export const stockService = {
  // GET /stock/levels — tồn kho chi tiết theo sản phẩm / kho / lô
  getLevels: async (query: QueryStockLevelDto = {}): Promise<Paginated<StockLevel>> => {
    const res = await api.get('/stock/levels', { params: query })
    return res.data
  },

  // GET /stock/movements — thẻ kho (lịch sử biến động)
  getMovements: async (query: QueryMovementDto = {}): Promise<Paginated<StockMovement>> => {
    const res = await api.get('/stock/movements', { params: query })
    return res.data
  },

  // GET /stock/low-stock — sản phẩm dưới định mức tồn
  getLowStock: async (query: QueryLowStockDto = {}): Promise<Paginated<Product>> => {
    const res = await api.get('/stock/low-stock', { params: query })
    return res.data
  },
}
