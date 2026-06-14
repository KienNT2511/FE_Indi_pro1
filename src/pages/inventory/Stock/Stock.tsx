import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { stockService } from '../../../services/inventory/stock.service'
import { warehousesService } from '../../../services/inventory/warehouses.service'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import Table from '../../../components/ui/Table/Table'
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column } from '../../../components/ui/Table/type'
import type { StockLevel } from '../../../services/inventory/stock.types'
import type { Warehouse } from '../../../services/inventory/warehouses.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 12

export default function Stock() {
  const { t, lang } = useLanguage()
  const s = t.inventory.stock

  const [items, setItems] = useState<StockLevel[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [onlyInStock, setOnlyInStock] = useState(true)
  const [page, setPage] = useState(1)

  const fmtDate = useMemo(() => new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  useEffect(() => {
    warehousesService.getAll({ limit: 1000, sortBy: 'name', sortDir: 'asc' }).then((r) => setWarehouses(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch, warehouseId, onlyInStock])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await stockService.getLevels({
        search: debouncedSearch || undefined,
        warehouseId: warehouseId || undefined,
        onlyInStock: onlyInStock ? 'true' : undefined,
        page,
        limit: LIMIT,
      })
      setItems(res.data)
      setMeta(res.meta)
    } catch {
      setLoadError(s.loadError)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, warehouseId, onlyInStock, page, s.loadError])

  useEffect(() => { fetchData() }, [fetchData])

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<StockLevel>[] = [
    { key: 'product', header: s.colProduct, render: (r) => <span className="font-semibold text-gray-900">{r.product?.name ?? '—'}</span> },
    { key: 'warehouse', header: s.colWarehouse, render: (r) => r.warehouse?.name ?? '—' },
    { key: 'batch', header: s.colBatch, render: (r) => (r.batch ? r.batch.code : <span className={styles.muted}>{s.noBatch}</span>) },
    { key: 'expiry', header: s.colExpiry, render: (r) => (r.batch?.expiryDate ? fmtDate.format(new Date(r.batch.expiryDate)) : <span className={styles.muted}>—</span>) },
    { key: 'unit', header: s.colUnit, render: (r) => r.product?.unit ?? <span className={styles.muted}>—</span> },
    { key: 'qty', header: s.colQty, align: 'right', render: (r) => <span className="font-semibold text-gray-900">{r.quantity}</span> },
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
          <h1 className={styles.pageTitle}>{s.title}</h1>
          <p className={styles.pageSubtitle}>{s.subtitle}</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={s.searchPlaceholder} startIcon={<SearchIcon size={16} />} className="bg-white shadow-sm" />
        </div>
        <div className={styles.filterBox}>
          <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} className="bg-white shadow-sm">
            <option value="">{t.inventory.common.allWarehouses}</option>
            {warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
          </Select>
        </div>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={onlyInStock} onChange={(e) => setOnlyInStock(e.target.checked)} />
          {s.onlyInStock}
        </label>
      </div>

      {loadError && <Alert type="error" message={loadError} />}

      <Table
        columns={columns}
        data={items}
        rowKey={(r) => r.id}
        loading={loading}
        emptyText={t.inventory.common.empty}
        loadingText={t.inventory.common.loading}
        footer={pagination}
      />
    </div>
  )
}
