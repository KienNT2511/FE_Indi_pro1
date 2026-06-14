// Mirror entity backend: modules/inventory/entities/warehouse.entity.ts
export interface Warehouse {
  id: string
  code: string
  name: string
  address: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateWarehouseDto {
  code: string
  name: string
  address?: string
  isActive?: boolean
}

export type UpdateWarehouseDto = Partial<CreateWarehouseDto>

export type WarehouseSortField = 'code' | 'name' | 'createdAt'

export interface QueryWarehouseDto {
  search?: string
  isActive?: 'true' | 'false'
  sortBy?: WarehouseSortField
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}
