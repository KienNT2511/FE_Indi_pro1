import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { purchaseOrdersService } from '../../../services/purchasing/purchaseOrders.service'
import Input from '../../../components/ui/Input/Input'
import Alert from '../../../components/ui/Alert/Alert'
import Table from '../../../components/ui/Table/Table'
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column } from '../../../components/ui/Table/type'
import type { SupplierDebt } from '../../../services/purchasing/purchaseOrders.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 12

export default function SupplierDebts() {
  const { t, lang } = useLanguage()
  const d = t.purchasing.debts

  const [items, setItems] = useState<SupplierDebt[]>([])
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

  useEffect(() => { setPage(1) }, [debouncedSearch])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await purchaseOrdersService.debts({ search: debouncedSearch || undefined, page, limit: LIMIT })
      setItems(res.data)
      setMeta(res.meta)
    } catch {
      setLoadError(d.loadError)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, page, d.loadError])

  useEffect(() => { fetchData() }, [fetchData])

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<SupplierDebt>[] = [
    { key: 'supplier', header: d.colSupplier, render: (r) => <span className="font-semibold text-gray-900">{r.supplierName}</span> },
    { key: 'phone', header: d.colPhone, render: (r) => (r.phone ? r.phone : <span className={styles.muted}>—</span>) },
    { key: 'orders', header: d.colOrders, align: 'right', render: (r) => r.orderCount },
    { key: 'total', header: d.colTotal, align: 'right', render: (r) => fmt.format(r.totalAmount) },
    { key: 'paid', header: d.colPaid, align: 'right', render: (r) => fmt.format(r.paidAmount) },
    { key: 'outstanding', header: d.colOutstanding, align: 'right', render: (r) => <span className={`${styles.badge} ${styles.badgeRed}`}>{fmt.format(r.outstanding)}</span> },
  ]

  const pagination = meta && meta.total > 0 && (
    <div className={styles.pagination}>
      <span className={styles.paginationInfo}>{t.purchasing.common.total}: {meta.total}</span>
      <div className={styles.paginationControls}>
        <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          <ChevronLeftIcon size={16} /> {t.purchasing.common.prev}
        </button>
        <span className={styles.pageLabel}>{t.purchasing.common.page} {meta.page} / {totalPages}</span>
        <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          {t.purchasing.common.next} <ChevronRightIcon size={16} />
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

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={d.searchPlaceholder} startIcon={<SearchIcon size={16} />} className="bg-white shadow-sm" />
        </div>
      </div>

      {loadError && <Alert type="error" message={loadError} />}

      <Table
        columns={columns}
        data={items}
        rowKey={(r) => r.supplierId}
        loading={loading}
        emptyText={d.empty}
        loadingText={t.purchasing.common.loading}
        footer={pagination}
      />
    </div>
  )
}
