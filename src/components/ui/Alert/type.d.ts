export type AlertType = 'error' | 'success' | 'info'

export interface AlertProps {
  type?: AlertType
  message: string
}
