import type { Product } from '../products/products.types'

export type BomSortField = 'code' | 'name' | 'createdAt'

export interface BomItem {
  id: string
  bomId: string
  materialProduct: Product
  materialProductId: string
  materialName: string
  quantity: number
  note: string | null
}

export interface BillOfMaterials {
  id: string
  code: string
  name: string
  product: Product
  productId: string
  isActive: boolean
  note: string | null
  items: BomItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateBomItemDto {
  materialProductId: string
  quantity: number
  note?: string
}

export interface CreateBomDto {
  name: string
  productId: string
  isActive?: boolean
  note?: string
  items: CreateBomItemDto[]
}

export type UpdateBomDto = Partial<CreateBomDto>

export interface QueryBomDto {
  search?: string
  productId?: string
  sortBy?: BomSortField
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}
