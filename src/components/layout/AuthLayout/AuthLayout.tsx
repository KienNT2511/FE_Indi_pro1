import { Link } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import LanguageSwitcher from '../../ui/LanguageSwitcher/LanguageSwitcher'
import { AppLogoIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { AuthLayoutProps } from './type'

export default function AuthLayout({ children, title, subtitle, footerText, footerLinkLabel, footerLinkTo }: AuthLayoutProps) {
  const { t } = useLanguage()

  return (
    <div className={styles.wrapper}>

      <div className={styles.appName}>
        <div className={styles.appNameIcon}>
          <AppLogoIcon size={22} />
        </div>
        <span className={styles.appNameText}>{t.common.appName}</span>
      </div>

      <div className={styles.langSwitcher}>
        <LanguageSwitcher variant="dark" />
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.cardTitle}>{title}</h1>
          <p className={styles.cardSubtitle}>{subtitle}</p>
        </div>

        {children}

        <p className={styles.footer}>
          {footerText}{' '}
          <Link to={footerLinkTo} className={styles.footerLink}>
            {footerLinkLabel}
          </Link>
        </p>
      </div>
    </div>
  )
}
