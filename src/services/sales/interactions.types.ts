import type { Customer } from '../customers/customers.types'

export const INTERACTION_TYPES = ['call', 'email', 'meeting', 'note', 'other'] as const
export type InteractionType = (typeof INTERACTION_TYPES)[number]

export type InteractionSortField = 'interactionDate' | 'createdAt'

export interface CustomerInteraction {
  id: string
  customer: Customer
  customerId: string
  type: InteractionType
  subject: string
  content: string | null
  interactionDate: string
  nextFollowUp: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerInteractionDto {
  customerId: string
  type: InteractionType
  subject: string
  content?: string
  interactionDate?: string
  nextFollowUp?: string
}

export type UpdateCustomerInteractionDto = Partial<CreateCustomerInteractionDto>

export interface QueryCustomerInteractionDto {
  search?: string
  customerId?: string
  type?: InteractionType
  sortBy?: InteractionSortField
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}
