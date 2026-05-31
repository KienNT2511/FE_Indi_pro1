import { type ReactNode } from 'react'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  icon?: ReactNode
  onConfirm: () => void
  onCancel: () => void
}
