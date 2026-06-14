import { useLanguage } from '../../../context/LanguageContext'
import styles from './style.module.css'

export default function Dashboard() {
  const { t } = useLanguage()

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t.dashboard.title}</h1>
        <p className={styles.pageSubtitle}>{t.dashboard.subtitle}</p>
      </div>

      <div className={styles.card}>
        <p className={styles.welcome}>{t.dashboard.welcome}</p>
      </div>
    </div>
  )
}
