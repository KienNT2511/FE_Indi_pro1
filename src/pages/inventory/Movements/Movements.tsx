import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { stockService } from '../../../services/inventory/stock.service'
import { warehousesService } from '../../../services/inventory/warehouses.service'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import Table from '../../../components/ui/Table/Table'
import { ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column } from '../../../components/ui/Table/type'
import { MOVEMENT_TYPES, type MovementType, type StockMovement } from '../../../services/inventory/stock.types'
import type { Warehouse } from '../../../services/inventory/warehouses.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 15

export default function Movements() {
  const { t, lang } = useLanguage()
  const m = t.inventory.movements

  const [items, setItems] = useState<StockMovement[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])

  const [warehouseId, setWarehouseId] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)

  const fmtDateTime = useMemo(
    () => new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }),
    [lang],
  )

  useEffect(() => {
    warehousesService.getAll({ limit: 1000, sortBy: 'name', sortDir: 'asc' }).then((r) => setWarehouses(r.data)).catch(() => {})
  }, [])

  useEffect(() => { setPage(1) }, [warehouseId, type])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await stockService.getMovements({
        warehouseId: warehouseId || undefined,
        type: (type as MovementType) || undefined,
        page,
        limit: LIMIT,
      })
      setItems(res.data)
      setMeta(res.meta)
    } catch {
      setLoadError(m.loadError)
    } finally {
      setLoading(false)
    }
  }, [warehouseId, type, page, m.loadError])

  useEffect(() => { fetchData() }, [fetchData])

  const totalPages = meta?.totalPages ?? 1

  const typeBadge = (mt: MovementType) => {
    const cls = mt === 'receipt' || mt === 'transfer_in'
      ? styles.badgeGreen
      : mt === 'issue' || mt === 'transfer_out'
        ? styles.badgeRed
        : styles.badgeIndigo
    return <span className={`${styles.badge} ${cls}`}>{m.types[mt]}</span>
  }

  const columns: Column<StockMovement>[] = [
    { key: 'date', header: m.colDate, render: (r) => fmtDateTime.format(new Date(r.createdAt)) },
    { key: 'type', header: m.colType, render: (r) => typeBadge(r.type) },
    { key: 'product', header: m.colProduct, render: (r) => <span className="font-medium text-gray-900">{r.product?.name ?? '—'}</span> },
    { key: 'warehouse', header: m.colWarehouse, render: (r) => r.warehouse?.name ?? '—' },
    {
      key: 'change', header: m.colChange, align: 'right',
      render: (r) => <span className={r.quantityChange >= 0 ? styles.posNum : styles.negNum}>{r.quantityChange >= 0 ? `+${r.quantityChange}` : r.quantityChange}</span>,
    },
    { key: 'balance', header: m.colBalance, align: 'right', render: (r) => r.balanceAfter },
    { key: 'doc', header: m.colDoc, render: (r) => (r.docCode ? <span className="text-gray-500">{r.docCode}</span> : <span className={styles.muted}>—</span>) },
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
          <h1 className={styles.pageTitle}>{m.title}</h1>
          <p className={styles.pageSubtitle}>{m.subtitle}</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterBox}>
          <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} className="bg-white shadow-sm">
            <option value="">{t.inventory.common.allWarehouses}</option>
            {warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
          </Select>
        </div>
        <div className={styles.filterBox}>
          <Select value={type} onChange={(e) => setType(e.target.value)} className="bg-white shadow-sm">
            <option value="">{m.allTypes}</option>
            {MOVEMENT_TYPES.map((mt) => (<option key={mt} value={mt}>{m.types[mt]}</option>))}
          </Select>
        </div>
      </div>

      {loadError && <Alert type="error" message={loadError} />}

      <Table
        columns={columns}
        data={items}
        rowKey={(r) => r.id}
        loading={loading}
        emptyText={m.empty}
        loadingText={t.inventory.common.loading}
        footer={pagination}
      />
    </div>
  )
}
