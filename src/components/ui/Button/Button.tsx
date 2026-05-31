import styles from './style.module.css'
import type { Variant, ButtonProps } from './type'

const variantClass: Record<Variant, string> = {
  primary:   styles.primary,
  secondary: styles.secondary,
  danger:    styles.danger,
}

export default function Button({
  variant = 'primary',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`${styles.btn} ${variantClass[variant]} ${className}`}
      {...props}
    >
      {loading
        ? <span className={styles.spinner} />
        : children}
    </button>
  )
}
