import styles from './style.module.css'

export default function PageLoader() {
  return (
    <div className={styles.wrapper}>
      <span className={styles.spinner} />
    </div>
  )
}
