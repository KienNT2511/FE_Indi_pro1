import styles from './style.module.css'
import type { AlertType, AlertProps } from './type'

const typeClass: Record<AlertType, string> = {
  error:   styles.error,
  success: styles.success,
  info:    styles.info,
}

const iconPath: Record<AlertType, string> = {
  error:   'M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  success: 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  info:    'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
}

export default function Alert({ type = 'error', message }: AlertProps) {
  return (
    <div className={`${styles.alert} ${typeClass[type]}`}>
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={iconPath[type]} />
      </svg>
      <span>{message}</span>
    </div>
  )
}
