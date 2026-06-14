import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import styles from './style.module.css'

export default function Account() {
  const { user } = useAuth()
  const { t } = useLanguage()

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t.account.title}</h1>
        <p className={styles.pageSubtitle}>{t.account.subtitle}</p>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardSectionTitle}>{t.account.accountInfo}</h2>
        <div className={styles.list}>
          <div className={styles.listRow}>
            <span className={styles.listLabel}>{t.account.id}</span>
            <span className={`${styles.listValue} break-all`}>{user?.sub}</span>
          </div>
          <div className={styles.listRow}>
            <span className={styles.listLabel}>{t.account.email}</span>
            <span className={styles.listValue}>{user?.email}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
