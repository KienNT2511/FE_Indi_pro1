// Kiểu phân trang dùng chung cho mọi danh sách (khớp { data, meta } của backend)
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}
