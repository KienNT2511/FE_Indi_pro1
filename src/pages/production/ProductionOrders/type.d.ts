import type {
  CreateProductionOrderDto,
  ProductionCosting,
  ProductionOrder,
  ReportProductionDto,
} from '../../../services/production/productionOrders.types'

export interface ProductionOrderFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (dto: CreateProductionOrderDto) => Promise<void>
}

export interface ProductionOrderDetailModalProps {
  open: boolean
  order: ProductionOrder | null
  costing: ProductionCosting | null
  onClose: () => void
  onReport: () => void
  onCancelOrder: () => Promise<void>
}

export interface ReportModalProps {
  open: boolean
  order: ProductionOrder | null
  onClose: () => void
  onSubmit: (dto: ReportProductionDto) => Promise<void>
}
