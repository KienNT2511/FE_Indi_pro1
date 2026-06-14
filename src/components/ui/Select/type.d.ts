import { type SelectHTMLAttributes, type ReactNode } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  startIcon?: ReactNode
  error?: boolean
}
