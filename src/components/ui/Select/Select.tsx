import { ChevronDownIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { SelectProps } from './type'

export default function Select({ startIcon, error = false, className = '', children, ...props }: SelectProps) {
  return (
    <div className={styles.wrapper}>
      {startIcon && (
        <span className={styles.startIcon}>{startIcon}</span>
      )}
      <select
        className={[
          styles.select,
          error ? styles.selectError : styles.selectDefault,
          startIcon ? styles.hasStart : styles.noStart,
          className,
        ].join(' ')}
        {...props}
      >
        {children}
      </select>
      <span className={styles.chevron}>
        <ChevronDownIcon size={16} />
      </span>
    </div>
  )
}
