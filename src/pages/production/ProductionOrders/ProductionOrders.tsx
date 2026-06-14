import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { productionOrdersService } from '../../../services/production/productionOrders.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import Table from '../../../components/ui/Table/Table'
import ProductionOrderFormModal from './ProductionOrderFormModal'
import ProductionOrderDetailModal from './ProductionOrderDetailModal'
import ReportModal from './ReportModal'
import { SearchIcon, PlusIcon, ViewIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column } from '../../../components/ui/Table/type'
import {
  PRODUCTION_STATUSES,
  type CreateProductionOrderDto,
  type ProductionCosting,
  type ProductionOrder,
  type ProductionOrderStatus,
  type ProductionStats,
  type ReportProductionDto,
} from '../../../services/production/productionOrders.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 10

const STATUS_CLASS: Record<ProductionOrderStatus, string> = {
  planned: 'badgeGray',
  in_progress: 'badgeBlue',
  completed: 'badgeGreen',
  cancelled: 'badgeRed',
}

type ModalMode = 'none' | 'form' | 'detail' | 'report'

export default function ProductionOrders() {
  const { t, lang } = useLanguage()
  const o = t.production.orders

  const [items, setItems] = useState<ProductionOrder[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [stats, setStats] = useState<ProductionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const [mode, setMode] = useState<ModalMode>('none')
  const [selected, setSelected] = useState<ProductionOrder | null>(null)
  const [costing, setCosting] = useState<ProductionCosting | null>(null)

  const fmtDate = useMemo(() => new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch, status])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await productionOrdersService.getAll({
        search: debouncedSearch || undefined,
        status: (status as ProductionOrderStatus) || undefined,
        page,
        limit: LIMIT,
      })
      setItems(res.data)
      setMeta(res.meta)
    } catch {
      setLoadError(o.loadError)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, status, page, o.loadError])

  const fetchStats = useCallback(async () => {
    try { setStats(await productionOrdersService.stats()) } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { fetchStats() }, [fetchStats])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const refreshAll = async () => { await fetchData(); await fetchStats() }

  const handleCreate = async (dto: CreateProductionOrderDto) => {
    await productionOrdersService.create(dto)
    setMode('none')
    setNotice(o.createSuccess)
    setPage(1)
    await refreshAll()
  }

  const loadDetail = async (id: string) => {
    const [full, cost] = await Promise.all([
      productionOrdersService.getById(id),
      productionOrdersService.costing(id),
    ])
    setSelected(full)
    setCosting(cost)
  }

  const openDetail = async (po: ProductionOrder) => {
    await loadDetail(po.id)
    setMode('detail')
  }

  const handleReport = async (dto: ReportProductionDto) => {
    if (!selected) return
    await productionOrdersService.report(selected.id, dto)
    setNotice(o.reportSuccess)
    await loadDetail(selected.id)
    setMode('detail')
    await refreshAll()
  }

  const handleCancel = async () => {
    if (!selected) return
    await productionOrdersService.updateStatus(selected.id, 'cancelled')
    setMode('none')
    setSelected(null)
    setNotice(o.statusSuccess)
    await refreshAll()
  }

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<ProductionOrder>[] = [
    { key: 'code', header: o.colCode, render: (r) => <span className="font-semibold text-gray-900">{r.code}</span> },
    { key: 'product', header: o.colProduct, render: (r) => r.product?.name ?? '—' },
    { key: 'progress', header: o.colProgress, align: 'right', render: (r) => <span className="text-gray-700">{r.producedQty} / {r.plannedQty}</span> },
    { key: 'due', header: o.colDue, render: (r) => (r.dueDate ? fmtDate.format(new Date(r.dueDate)) : <span className={styles.muted}>—</span>) },
    { key: 'status', header: o.colStatus, render: (r) => <span className={`${styles.badge} ${styles[STATUS_CLASS[r.status]]}`}>{o.status[r.status]}</span> },
    {
      key: 'actions', header: o.colActions, align: 'right',
      render: (r) => (
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => openDetail(r)} title={o.viewAction}><ViewIcon size={16} /></button>
        </div>
      ),
    },
  ]

  const pagination = meta && meta.total > 0 && (
    <div className={styles.pagination}>
      <span className={styles.paginationInfo}>{t.production.common.total}: {meta.total}</span>
      <div className={styles.paginationControls}>
        <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          <ChevronLeftIcon size={16} /> {t.production.common.prev}
        </button>
        <span className={styles.pageLabel}>{t.production.common.page} {meta.page} / {totalPages}</span>
        <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          {t.production.common.next} <ChevronRightIcon size={16} />
        </button>
      </div>
    </div>
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{o.title}</h1>
          <p className={styles.pageSubtitle}>{o.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={() => setMode('form')} className={styles.actionBtn}><PlusIcon size={16} /> {o.addBtn}</Button>
        </div>
      </div>

      {stats && (
        <div className={styles.statGrid}>
          <div className={styles.statCard}><span className={styles.statLabel}>{o.statOrders}</span><span className={styles.statValue}>{stats.orderCount}</span></div>
          <div className={styles.statCard}><span className={styles.statLabel}>{o.statPlanned}</span><span className={styles.statValue}>{stats.totalPlanned}</span></div>
          <div className={styles.statCard}><span className={styles.statLabel}>{o.statProduced}</span><span className={styles.statValue}>{stats.totalProduced}</span></div>
          <div className={styles.statCard}><span className={styles.statLabel}>{o.status.completed}</span><span className={styles.statValue}>{stats.byStatus.completed ?? 0}</span></div>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={o.searchPlaceholder} startIcon={<SearchIcon size={16} />} className="bg-white shadow-sm" />
        </div>
        <div className={styles.filterBox}>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-white shadow-sm">
            <option value="">{t.production.common.allStatuses}</option>
            {PRODUCTION_STATUSES.map((st) => (<option key={st} value={st}>{o.status[st]}</option>))}
          </Select>
        </div>
      </div>

      {notice && <Alert type="success" message={notice} />}
      {loadError && <Alert type="error" message={loadError} />}

      <Table
        columns={columns}
        data={items}
        rowKey={(r) => r.id}
        loading={loading}
        emptyText={t.production.common.empty}
        loadingText={t.production.common.loading}
        footer={pagination}
      />

      <ProductionOrderFormModal open={mode === 'form'} onClose={() => setMode('none')} onSubmit={handleCreate} />

      <ProductionOrderDetailModal
        open={mode === 'detail'}
        order={selected}
        costing={costing}
        onClose={() => { setMode('none'); setSelected(null) }}
        onReport={() => setMode('report')}
        onCancelOrder={handleCancel}
      />

      <ReportModal open={mode === 'report'} order={selected} onClose={() => setMode('detail')} onSubmit={handleReport} />
    </div>
  )
}
