import { type ReactNode } from 'react'

export type SortDir = 'asc' | 'desc'

export type Align = 'left' | 'right' | 'center'

export interface Column<T> {
  key: string                                       // id duy nhất của cột
  header: ReactNode                                 // nhãn header
  // Giá trị thô dùng để sort/search (bắt buộc nếu cột sortable/searchable)
  accessor?: (row: T) => string | number | null | undefined
  render?: (row: T) => ReactNode                    // custom render ô (mặc định: giá trị accessor)
  sortable?: boolean
  searchable?: boolean
  align?: Align
  width?: string                                    // ví dụ '120px', '20%'
}

export interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T) => string | number
  loading?: boolean
  emptyText?: ReactNode
  loadingText?: ReactNode
  searchPlaceholder?: string                        // placeholder chung cho ô search cột
  footer?: ReactNode                                // ví dụ: phân trang, đặt trong card
  // Controlled sort: truyền cả 3 prop này để parent tự xử lý (vd: sort phía server).
  // Khi có onSortChange, Table KHÔNG sort client-side mà chỉ phát sự kiện.
  sortKey?: string | null
  sortDir?: SortDir
  onSortChange?: (key: string | null, dir: SortDir) => void
}
