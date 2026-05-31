import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import styles from './style.module.css'

export default function Dashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t.dashboard.title}</h1>
        <p className={styles.pageSubtitle}>{t.dashboard.subtitle}</p>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardSectionTitle}>{t.dashboard.accountInfo}</h2>
        <div className={styles.list}>
          <div className={styles.listRow}>
            <span className={styles.listLabel}>{t.dashboard.id}</span>
            <span className={`${styles.listValue} break-all`}>{user?.sub}</span>
          </div>
          <div className={styles.listRow}>
            <span className={styles.listLabel}>{t.dashboard.email}</span>
            <span className={styles.listValue}>{user?.email}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
