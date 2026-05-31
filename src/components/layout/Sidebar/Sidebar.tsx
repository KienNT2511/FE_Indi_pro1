import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import ConfirmDialog from '../../ui/ConfirmDialog/ConfirmDialog'
import LanguageSwitcher from '../../ui/LanguageSwitcher/LanguageSwitcher'
import { AppLogoIcon, DashboardIcon, LockIcon, LogoutIcon } from '../../../assets/icons'
import styles from './style.module.css'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)

  const navItems = [
    { label: t.nav.dashboard,      to: '/dashboard',       icon: <DashboardIcon /> },
    { label: t.nav.changePassword, to: '/change-password', icon: <LockIcon /> },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      <aside className={styles.aside}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>
            <AppLogoIcon size={16} />
          </div>
          <span className={styles.logoText}>{t.common.appName}</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : styles.navItemIdle}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? styles.navIconActive : styles.navIconIdle}>
                    {item.icon}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={styles.langArea}>
          <LanguageSwitcher />
        </div>

        <div className={styles.userArea}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className={styles.userEmailText}>{user?.email}</p>
            </div>
          </div>
          <button onClick={() => setShowConfirm(true)} className={styles.logoutBtn}>
            <LogoutIcon />
            {t.nav.logout}
          </button>
        </div>
      </aside>

      <ConfirmDialog
        open={showConfirm}
        title={t.nav.logoutConfirmTitle}
        description={t.nav.logoutConfirmDesc}
        confirmLabel={t.nav.logoutConfirm}
        cancelLabel={t.nav.logoutCancel}
        variant="danger"
        icon={<LogoutIcon />}
        onConfirm={handleLogout}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  )
}
