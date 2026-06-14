import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { receivablesService } from '../../../services/sales/receivables.service'
import { purchaseOrdersService } from '../../../services/purchasing/purchaseOrders.service'
import Input from '../../../components/ui/Input/Input'
import Alert from '../../../components/ui/Alert/Alert'
import Table from '../../../components/ui/Table/Table'
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column } from '../../../components/ui/Table/type'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 12

type Tab = 'receivable' | 'payable'

interface DebtRow {
  id: string
  name: string
  phone: string | null
  orderCount: number
  totalAmount: number
  paidAmount: number
  outstanding: number
}

export default function Debts() {
  const { t, lang } = useLanguage()
  const d = t.finance.debts

  const [tab, setTab] = useState<Tab>('receivable')
  const [items, setItems] = useState<DebtRow[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  const fmt = useMemo(() => new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch, tab])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const params = { search: debouncedSearch || undefined, page, limit: LIMIT }
      if (tab === 'receivable') {
        const res = await receivablesService.debts(params)
        setItems(res.data.map((r) => ({ id: r.customerId, name: r.customerName, phone: r.phone, orderCount: r.orderCount, totalAmount: r.totalAmount, paidAmount: r.paidAmount, outstanding: r.outstanding })))
        setMeta(res.meta)
      } else {
        const res = await purchaseOrdersService.debts(params)
        setItems(res.data.map((r) => ({ id: r.supplierId, name: r.supplierName, phone: r.phone, orderCount: r.orderCount, totalAmount: r.totalAmount, paidAmount: r.paidAmount, outstanding: r.outstanding })))
        setMeta(res.meta)
      }
    } catch {
      setLoadError(d.loadError)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, page, tab, d.loadError])

  useEffect(() => { fetchData() }, [fetchData])

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<DebtRow>[] = [
    { key: 'name', header: d.colName, render: (r) => <span className="font-semibold text-gray-900">{r.name}</span> },
    { key: 'phone', header: d.colPhone, render: (r) => (r.phone ? r.phone : <span className={styles.muted}>—</span>) },
    { key: 'orders', header: d.colOrders, align: 'right', render: (r) => r.orderCount },
    { key: 'total', header: d.colTotal, align: 'right', render: (r) => fmt.format(r.totalAmount) },
    { key: 'paid', header: d.colPaid, align: 'right', render: (r) => fmt.format(r.paidAmount) },
    { key: 'outstanding', header: d.colOutstanding, align: 'right', render: (r) => <span className={`${styles.badge} ${tab === 'receivable' ? styles.badgeYellow : styles.badgeRed}`}>{fmt.format(r.outstanding)}</span> },
  ]

  const pagination = meta && meta.total > 0 && (
    <div className={styles.pagination}>
      <span className={styles.paginationInfo}>{t.finance.common.total}: {meta.total}</span>
      <div className={styles.paginationControls}>
        <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          <ChevronLeftIcon size={16} /> {t.finance.common.prev}
        </button>
        <span className={styles.pageLabel}>{t.finance.common.page} {meta.page} / {totalPages}</span>
        <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          {t.finance.common.next} <ChevronRightIcon size={16} />
        </button>
      </div>
    </div>
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{d.title}</h1>
          <p className={styles.pageSubtitle}>{d.subtitle}</p>
        </div>
      </div>

      <div className={styles.tabBar}>
        <button className={`${styles.tab} ${tab === 'receivable' ? styles.tabActive : ''}`} onClick={() => setTab('receivable')}>{d.tabReceivable}</button>
        <button className={`${styles.tab} ${tab === 'payable' ? styles.tabActive : ''}`} onClick={() => setTab('payable')}>{d.tabPayable}</button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.finance.common.search} startIcon={<SearchIcon size={16} />} className="bg-white shadow-sm" />
        </div>
      </div>

      {loadError && <Alert type="error" message={loadError} />}

      <Table
        columns={columns}
        data={items}
        rowKey={(r) => r.id}
        loading={loading}
        emptyText={d.empty}
        loadingText={t.finance.common.loading}
        footer={pagination}
      />
    </div>
  )
}
