import styles from './style.module.css'
import type { InputProps } from './type'

export default function Input({ startIcon, endIcon, error = false, className = '', ...props }: InputProps) {
  return (
    <div className={styles.wrapper}>
      {startIcon && (
        <span className={styles.startIcon}>{startIcon}</span>
      )}
      <input
        className={[
          styles.input,
          error ? styles.inputError : styles.inputDefault,
          startIcon ? styles.hasStart : styles.noStart,
          endIcon   ? styles.hasEnd   : styles.noEnd,
          className,
        ].join(' ')}
        {...props}
      />
      {endIcon && (
        <span className={styles.endIcon}>{endIcon}</span>
      )}
    </div>
  )
}
