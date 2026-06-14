import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { purchaseOrdersService } from '../../../services/purchasing/purchaseOrders.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import Table from '../../../components/ui/Table/Table'
import PurchaseOrderFormModal from './PurchaseOrderFormModal'
import PurchaseOrderDetailModal from './PurchaseOrderDetailModal'
import ReceiveModal from './ReceiveModal'
import PayModal from './PayModal'
import { SearchIcon, PlusIcon, ViewIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column } from '../../../components/ui/Table/type'
import {
  PO_STATUSES,
  type CreatePurchaseOrderDto,
  type CreateSupplierPaymentDto,
  type PurchaseOrder,
  type PurchaseOrderStatus,
  type PurchaseStats,
  type ReceivePurchaseOrderDto,
  type SupplierPayment,
} from '../../../services/purchasing/purchaseOrders.types'
import { PAYMENT_STATUSES, type PaymentStatus } from '../../../services/orders/orders.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 10

const STATUS_CLASS: Record<PurchaseOrderStatus, string> = {
  pending: 'badgeYellow',
  confirmed: 'badgeBlue',
  partially_received: 'badgeIndigo',
  received: 'badgeGreen',
  cancelled: 'badgeGray',
}

type ModalMode = 'none' | 'form' | 'detail' | 'receive' | 'pay'

export default function PurchaseOrders() {
  const { t, lang } = useLanguage()
  const o = t.purchasing.orders

  const [items, setItems] = useState<PurchaseOrder[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [stats, setStats] = useState<PurchaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [page, setPage] = useState(1)

  const [mode, setMode] = useState<ModalMode>('none')
  const [selected, setSelected] = useState<PurchaseOrder | null>(null)
  const [payments, setPayments] = useState<SupplierPayment[]>([])

  const fmt = useMemo(() => new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])
  const fmtDate = useMemo(() => new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch, status, paymentStatus])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await purchaseOrdersService.getAll({
        search: debouncedSearch || undefined,
        status: (status as PurchaseOrderStatus) || undefined,
        paymentStatus: (paymentStatus as PaymentStatus) || undefined,
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
  }, [debouncedSearch, status, paymentStatus, page, o.loadError])

  const fetchStats = useCallback(async () => {
    try { setStats(await purchaseOrdersService.stats()) } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { fetchStats() }, [fetchStats])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const refreshAll = async () => { await fetchData(); await fetchStats() }

  const handleCreate = async (dto: CreatePurchaseOrderDto) => {
    await purchaseOrdersService.create(dto)
    setMode('none')
    setNotice(o.createSuccess)
    setPage(1)
    await refreshAll()
  }

  const openDetail = async (po: PurchaseOrder) => {
    const [full, pays] = await Promise.all([
      purchaseOrdersService.getById(po.id),
      purchaseOrdersService.getPayments(po.id),
    ])
    setSelected(full)
    setPayments(pays)
    setMode('detail')
  }

  const reloadSelected = async (id: string) => {
    const [full, pays] = await Promise.all([
      purchaseOrdersService.getById(id),
      purchaseOrdersService.getPayments(id),
    ])
    setSelected(full)
    setPayments(pays)
  }

  const handleReceive = async (dto: ReceivePurchaseOrderDto) => {
    if (!selected) return
    await purchaseOrdersService.receive(selected.id, dto)
    setNotice(o.receiveSuccess)
    await reloadSelected(selected.id)
    setMode('detail')
    await refreshAll()
  }

  const handlePay = async (dto: CreateSupplierPaymentDto) => {
    if (!selected) return
    await purchaseOrdersService.pay(selected.id, dto)
    setNotice(o.paySuccess)
    await reloadSelected(selected.id)
    setMode('detail')
    await refreshAll()
  }

  const handleCancel = async () => {
    if (!selected) return
    await purchaseOrdersService.updateStatus(selected.id, 'cancelled')
    setMode('none')
    setSelected(null)
    setNotice(o.statusSuccess)
    await refreshAll()
  }

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<PurchaseOrder>[] = [
    { key: 'code', header: o.colCode, render: (r) => <span className="font-semibold text-gray-900">{r.code}</span> },
    { key: 'supplier', header: o.colSupplier, render: (r) => r.supplier?.name ?? '—' },
    { key: 'date', header: o.colDate, render: (r) => fmtDate.format(new Date(r.orderDate)) },
    { key: 'total', header: o.colTotal, align: 'right', render: (r) => <span className="font-medium text-gray-900">{fmt.format(r.total)}</span> },
    { key: 'status', header: o.colStatus, render: (r) => <span className={`${styles.badge} ${styles[STATUS_CLASS[r.status]]}`}>{o.status[r.status]}</span> },
    { key: 'payment', header: o.colPayment, render: (r) => <span className="text-sm text-gray-600">{t.orders.payStatus[r.paymentStatus]}</span> },
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
          <h1 className={styles.pageTitle}>{o.title}</h1>
          <p className={styles.pageSubtitle}>{o.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={() => setMode('form')} className={styles.actionBtn}><PlusIcon size={16} /> {o.addBtn}</Button>
        </div>
      </div>

      {stats && (
        <div className={styles.statGrid}>
          <div className={styles.statCard}><span className={styles.statLabel}>{o.statTotalValue}</span><span className={styles.statValue}>{fmt.format(stats.totalValue)}</span></div>
          <div className={styles.statCard}><span className={styles.statLabel}>{o.statPaid}</span><span className={styles.statValue}>{fmt.format(stats.totalPaid)}</span></div>
          <div className={styles.statCard}><span className={styles.statLabel}>{o.statOutstanding}</span><span className={styles.statValueWarn}>{fmt.format(stats.outstanding)}</span></div>
          <div className={styles.statCard}><span className={styles.statLabel}>{o.statOrders}</span><span className={styles.statValue}>{stats.orderCount}</span></div>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={o.searchPlaceholder} startIcon={<SearchIcon size={16} />} className="bg-white shadow-sm" />
        </div>
        <div className={styles.filterBox}>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-white shadow-sm">
            <option value="">{t.purchasing.common.allStatuses}</option>
            {PO_STATUSES.map((st) => (<option key={st} value={st}>{o.status[st]}</option>))}
          </Select>
        </div>
        <div className={styles.filterBox}>
          <Select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="bg-white shadow-sm">
            <option value="">{o.allPayments}</option>
            {PAYMENT_STATUSES.map((st) => (<option key={st} value={st}>{t.orders.payStatus[st]}</option>))}
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
        emptyText={t.purchasing.common.empty}
        loadingText={t.purchasing.common.loading}
        footer={pagination}
      />

      <PurchaseOrderFormModal open={mode === 'form'} onClose={() => setMode('none')} onSubmit={handleCreate} />

      <PurchaseOrderDetailModal
        open={mode === 'detail'}
        order={selected}
        payments={payments}
        onClose={() => { setMode('none'); setSelected(null) }}
        onReceive={() => setMode('receive')}
        onPay={() => setMode('pay')}
        onCancelOrder={handleCancel}
      />

      <ReceiveModal open={mode === 'receive'} order={selected} onClose={() => setMode('detail')} onSubmit={handleReceive} />
      <PayModal open={mode === 'pay'} order={selected} onClose={() => setMode('detail')} onSubmit={handlePay} />
    </div>
  )
}
