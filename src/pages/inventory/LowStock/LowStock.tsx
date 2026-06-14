import { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { stockService } from '../../../services/inventory/stock.service'
import Input from '../../../components/ui/Input/Input'
import Alert from '../../../components/ui/Alert/Alert'
import Table from '../../../components/ui/Table/Table'
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column } from '../../../components/ui/Table/type'
import type { Product } from '../../../services/products/products.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 12

export default function LowStock() {
  const { t } = useLanguage()
  const l = t.inventory.lowStock

  const [items, setItems] = useState<Product[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await stockService.getLowStock({ search: debouncedSearch || undefined, page, limit: LIMIT })
      setItems(res.data)
      setMeta(res.meta)
    } catch {
      setLoadError(l.loadError)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, page, l.loadError])

  useEffect(() => { fetchData() }, [fetchData])

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<Product>[] = [
    { key: 'product', header: l.colProduct, render: (r) => <span className="font-semibold text-gray-900">{r.name}</span> },
    { key: 'category', header: l.colCategory, render: (r) => r.category },
    { key: 'unit', header: l.colUnit, render: (r) => r.unit ?? <span className={styles.muted}>—</span> },
    { key: 'qty', header: l.colQty, align: 'right', render: (r) => <span className={styles.negNum}>{r.quantity}</span> },
    { key: 'min', header: l.colMinStock, align: 'right', render: (r) => r.minStock },
    {
      key: 'shortage', header: l.colShortage, align: 'right',
      render: (r) => <span className={`${styles.badge} ${styles.badgeRed}`}>-{Math.max(0, r.minStock - r.quantity)}</span>,
    },
  ]

  const pagination = meta && meta.total > 0 && (
    <div className={styles.pagination}>
      <span className={styles.paginationInfo}>{t.inventory.common.total}: {meta.total}</span>
      <div className={styles.paginationControls}>
        <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          <ChevronLeftIcon size={16} /> {t.inventory.common.prev}
        </button>
        <span className={styles.pageLabel}>{t.inventory.common.page} {meta.page} / {totalPages}</span>
        <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          {t.inventory.common.next} <ChevronRightIcon size={16} />
        </button>
      </div>
    </div>
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{l.title}</h1>
          <p className={styles.pageSubtitle}>{l.subtitle}</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={l.searchPlaceholder} startIcon={<SearchIcon size={16} />} className="bg-white shadow-sm" />
        </div>
      </div>

      {loadError && <Alert type="error" message={loadError} />}

      <Table
        columns={columns}
        data={items}
        rowKey={(r) => r.id}
        loading={loading}
        emptyText={l.empty}
        loadingText={t.inventory.common.loading}
        footer={pagination}
      />
    </div>
  )
}
