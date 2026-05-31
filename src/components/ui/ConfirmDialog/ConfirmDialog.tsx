import Button from '../Button/Button'
import styles from './style.module.css'
import type { ConfirmDialogProps } from './type'

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Huỷ',
  variant = 'danger',
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onCancel} />

      <div className={styles.dialog}>
        {icon && (
          <div className={`${styles.iconWrapper} ${variant === 'danger' ? styles.iconDanger : styles.iconPrimary}`}>
            <span className={variant === 'danger' ? styles.iconTextDanger : styles.iconTextPrimary}>
              {icon}
            </span>
          </div>
        )}

        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          {description && <p className={styles.description}>{description}</p>}
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} className="flex-1">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
