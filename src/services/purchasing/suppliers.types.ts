// Mirror entity backend: modules/purchasing/entities/supplier.entity.ts
export interface Supplier {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  taxCode: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateSupplierDto {
  name: string
  phone?: string
  email?: string
  address?: string
  taxCode?: string
  note?: string
}

export type UpdateSupplierDto = Partial<CreateSupplierDto>

export type SupplierSortField = 'name' | 'phone' | 'createdAt'

export interface QuerySupplierDto {
  search?: string
  sortBy?: SupplierSortField
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}
