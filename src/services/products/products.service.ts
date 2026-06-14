import api from '../../api/axios'
import type {
  CreateProductDto,
  ImportResult,
  PaginatedProducts,
  Product,
  QueryProductDto,
  UpdateProductDto,
} from './products.types'

export const productsService = {
  // GET /products — danh sách + phân trang, lọc theo search/category
  getAll: async (query: QueryProductDto = {}): Promise<PaginatedProducts> => {
    const res = await api.get('/products', { params: query })
    return res.data
  },

  // GET /products/:id — chi tiết 1 sản phẩm
  getById: async (id: string): Promise<Product> => {
    const res = await api.get(`/products/${id}`)
    return res.data
  },

  // POST /products — tạo sản phẩm mới
  create: async (dto: CreateProductDto): Promise<Product> => {
    const res = await api.post('/products', dto)
    return res.data
  },

  // PATCH /products/:id — cập nhật sản phẩm
  update: async (id: string, dto: UpdateProductDto): Promise<Product> => {
    const res = await api.patch(`/products/${id}`, dto)
    return res.data
  },

  // DELETE /products/:id — xoá sản phẩm (204 No Content)
  remove: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`)
  },

  // POST /products/upload — import từ file Excel (.xlsx/.xls)
  uploadExcel: async (file: File): Promise<ImportResult> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post('/products/upload', formData)
    return res.data
  },
}
