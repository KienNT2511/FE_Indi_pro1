import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import ConfirmDialog from '../../ui/ConfirmDialog/ConfirmDialog'
import LanguageSwitcher from '../../ui/LanguageSwitcher/LanguageSwitcher'
import { AppLogoIcon, DashboardIcon, BoxIcon, ReceiptIcon, UsersIcon, LockIcon, LogoutIcon, WarehouseIcon, WarningCircleIcon, CalendarIcon, ArrowDownIcon, ArrowUpIcon, TransferIcon, ClipboardIcon, TruckIcon, CartIcon, WalletIcon, FileTextIcon, CoinsIcon, ChatIcon, FactoryIcon, LayersIcon, BankIcon, ChartBarIcon } from '../../../assets/icons'
import styles from './style.module.css'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)

  const navItems = [
    { label: t.nav.dashboard, to: '/dashboard', icon: <DashboardIcon /> },
    { label: t.nav.orders,    to: '/orders',    icon: <ReceiptIcon /> },
    { label: t.nav.products,  to: '/products',  icon: <BoxIcon /> },
    { label: t.nav.customers, to: '/customers', icon: <UsersIcon /> },
  ]

  const inventoryNav = [
    { label: t.inventory.nav.stock,      to: '/inventory/stock',      icon: <BoxIcon /> },
    { label: t.inventory.nav.lowStock,   to: '/inventory/low-stock',  icon: <WarningCircleIcon /> },
    { label: t.inventory.nav.receipts,   to: '/inventory/receipts',   icon: <ArrowDownIcon /> },
    { label: t.inventory.nav.issues,     to: '/inventory/issues',     icon: <ArrowUpIcon /> },
    { label: t.inventory.nav.transfers,  to: '/inventory/transfers',  icon: <TransferIcon /> },
    { label: t.inventory.nav.counts,     to: '/inventory/counts',     icon: <ClipboardIcon /> },
    { label: t.inventory.nav.batches,    to: '/inventory/batches',    icon: <CalendarIcon /> },
    { label: t.inventory.nav.movements,  to: '/inventory/movements',  icon: <ReceiptIcon /> },
    { label: t.inventory.nav.warehouses, to: '/inventory/warehouses', icon: <WarehouseIcon /> },
  ]

  const purchasingNav = [
    { label: t.purchasing.nav.orders,    to: '/purchasing/orders',    icon: <CartIcon /> },
    { label: t.purchasing.nav.requests,  to: '/purchasing/requests',  icon: <ClipboardIcon /> },
    { label: t.purchasing.nav.suppliers, to: '/purchasing/suppliers', icon: <TruckIcon /> },
    { label: t.purchasing.nav.debts,     to: '/purchasing/debts',     icon: <WalletIcon /> },
  ]

  const salesNav = [
    { label: t.sales.nav.quotations,  to: '/sales/quotations',  icon: <FileTextIcon /> },
    { label: t.sales.nav.deliveries,  to: '/sales/deliveries',  icon: <TruckIcon /> },
    { label: t.sales.nav.receivables, to: '/sales/receivables', icon: <CoinsIcon /> },
    { label: t.sales.nav.crm,         to: '/sales/crm',         icon: <ChatIcon /> },
  ]

  const productionNav = [
    { label: t.production.nav.orders, to: '/production/orders', icon: <FactoryIcon /> },
    { label: t.production.nav.boms,   to: '/production/boms',   icon: <LayersIcon /> },
  ]

  const financeNav = [
    { label: t.finance.nav.reports,      to: '/finance/reports',      icon: <ChartBarIcon /> },
    { label: t.finance.nav.transactions, to: '/finance/transactions', icon: <ReceiptIcon /> },
    { label: t.finance.nav.debts,        to: '/finance/debts',        icon: <WalletIcon /> },
    { label: t.finance.nav.accounts,     to: '/finance/accounts',     icon: <BankIcon /> },
  ]

  const renderNavLink = (item: { label: string; to: string; icon: ReactNode }) => (
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
  )

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
          {navItems.map(renderNavLink)}

          <span className={styles.navGroupLabel}>{t.inventory.nav.group}</span>
          {inventoryNav.map(renderNavLink)}

          <span className={styles.navGroupLabel}>{t.purchasing.nav.group}</span>
          {purchasingNav.map(renderNavLink)}

          <span className={styles.navGroupLabel}>{t.sales.nav.group}</span>
          {salesNav.map(renderNavLink)}

          <span className={styles.navGroupLabel}>{t.production.nav.group}</span>
          {productionNav.map(renderNavLink)}

          <span className={styles.navGroupLabel}>{t.finance.nav.group}</span>
          {financeNav.map(renderNavLink)}
        </nav>

        <div className={styles.userArea}>
          <div className={styles.settingsGroup}>
            <NavLink
              to="/change-password"
              className={({ isActive }) =>
                `${styles.userLink} ${isActive ? styles.userLinkActive : styles.userLinkIdle}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? styles.navIconActive : styles.navIconIdle}>
                    <LockIcon />
                  </span>
                  {t.nav.changePassword}
                </>
              )}
            </NavLink>

            <div className={styles.langRow}>
              <span className={styles.langLabel}>{t.nav.language}</span>
              <LanguageSwitcher />
            </div>
          </div>

          <NavLink
            to="/account"
            className={({ isActive }) =>
              `${styles.userCard} ${isActive ? styles.userCardActive : ''}`
            }
            title={t.nav.account}
          >
            <div className={styles.userAvatar}>
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className={styles.userMeta}>
              <p className={styles.userEmailText}>{user?.email}</p>
              <p className={styles.userStatus}>{t.nav.account}</p>
            </div>
          </NavLink>

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
