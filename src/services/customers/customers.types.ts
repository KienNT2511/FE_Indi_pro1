// Mirror entity backend: modules/customers/entities/customer.entity.ts
export interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerDto {
  name: string
  phone?: string
  email?: string
  address?: string
  note?: string
}

export type UpdateCustomerDto = Partial<CreateCustomerDto>

// Whitelist cột sort (khớp CUSTOMER_SORT_FIELDS backend)
export type CustomerSortField = 'name' | 'phone' | 'createdAt'

export interface QueryCustomerDto {
  search?: string
  sortBy?: CustomerSortField
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}
