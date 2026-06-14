import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { receivablesService } from '../../../services/sales/receivables.service'
import Input from '../../../components/ui/Input/Input'
import Alert from '../../../components/ui/Alert/Alert'
import Table from '../../../components/ui/Table/Table'
import CollectModal from './CollectModal'
import { SearchIcon, WalletIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column } from '../../../components/ui/Table/type'
import type { CreateCustomerPaymentDto, CustomerDebt, SalesStats } from '../../../services/sales/receivables.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 12

export default function Receivables() {
  const { t, lang } = useLanguage()
  const r = t.sales.receivables

  const [items, setItems] = useState<CustomerDebt[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [stats, setStats] = useState<SalesStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [collectTarget, setCollectTarget] = useState<CustomerDebt | null>(null)

  const fmt = useMemo(() => new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await receivablesService.debts({ search: debouncedSearch || undefined, page, limit: LIMIT })
      setItems(res.data)
      setMeta(res.meta)
    } catch {
      setLoadError(r.loadError)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, page, r.loadError])

  const fetchStats = useCallback(async () => {
    try { setStats(await receivablesService.stats()) } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { fetchStats() }, [fetchStats])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const handleCollect = async (orderId: string, dto: CreateCustomerPaymentDto) => {
    await receivablesService.pay(orderId, dto)
    setCollectTarget(null)
    setNotice(r.collectSuccess)
    await fetchData()
    await fetchStats()
  }

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<CustomerDebt>[] = [
    { key: 'customer', header: r.colCustomer, render: (row) => <span className="font-semibold text-gray-900">{row.customerName}</span> },
    { key: 'phone', header: r.colPhone, render: (row) => (row.phone ? row.phone : <span className={styles.muted}>—</span>) },
    { key: 'orders', header: r.colOrders, align: 'right', render: (row) => row.orderCount },
    { key: 'total', header: r.colTotal, align: 'right', render: (row) => fmt.format(row.totalAmount) },
    { key: 'paid', header: r.colPaid, align: 'right', render: (row) => fmt.format(row.paidAmount) },
    { key: 'outstanding', header: r.colOutstanding, align: 'right', render: (row) => <span className={`${styles.badge} ${styles.badgeRed}`}>{fmt.format(row.outstanding)}</span> },
    {
      key: 'actions', header: r.colActions, align: 'right',
      render: (row) => (
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => setCollectTarget(row)} title={r.collectAction}><WalletIcon size={16} /></button>
        </div>
      ),
    },
  ]

  const pagination = meta && meta.total > 0 && (
    <div className={styles.pagination}>
      <span className={styles.paginationInfo}>{t.sales.common.total}: {meta.total}</span>
      <div className={styles.paginationControls}>
        <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          <ChevronLeftIcon size={16} /> {t.sales.common.prev}
        </button>
        <span className={styles.pageLabel}>{t.sales.common.page} {meta.page} / {totalPages}</span>
        <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          {t.sales.common.next} <ChevronRightIcon size={16} />
        </button>
      </div>
    </div>
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{r.title}</h1>
          <p className={styles.pageSubtitle}>{r.subtitle}</p>
        </div>
      </div>

      {stats && (
        <div className={styles.statGrid}>
          <div className={styles.statCard}><span className={styles.statLabel}>{r.statRevenue}</span><span className={styles.statValue}>{fmt.format(stats.revenue)}</span></div>
          <div className={styles.statCard}><span className={styles.statLabel}>{r.statCollected}</span><span className={styles.statValue}>{fmt.format(stats.collected)}</span></div>
          <div className={styles.statCard}><span className={styles.statLabel}>{r.statOutstanding}</span><span className={styles.statValueWarn}>{fmt.format(stats.outstanding)}</span></div>
          <div className={styles.statCard}><span className={styles.statLabel}>{r.statOrders}</span><span className={styles.statValue}>{stats.orderCount}</span></div>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={r.searchPlaceholder} startIcon={<SearchIcon size={16} />} className="bg-white shadow-sm" />
        </div>
      </div>

      {notice && <Alert type="success" message={notice} />}
      {loadError && <Alert type="error" message={loadError} />}

      <Table
        columns={columns}
        data={items}
        rowKey={(row) => row.customerId}
        loading={loading}
        emptyText={r.empty}
        loadingText={t.sales.common.loading}
        footer={pagination}
      />

      <CollectModal open={collectTarget !== null} customer={collectTarget} onClose={() => setCollectTarget(null)} onSubmit={handleCollect} />
    </div>
  )
}
