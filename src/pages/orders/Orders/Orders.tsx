import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { ordersService } from '../../../services/orders/orders.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog'
import Table from '../../../components/ui/Table/Table'
import OrderFormModal from './OrderFormModal'
import OrderDetailModal from './OrderDetailModal'
import {
  SearchIcon, PlusIcon, ViewIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon,
} from '../../../assets/icons'
import {
  ORDER_STATUSES, PAYMENT_STATUSES,
} from '../../../services/orders/orders.types'
import styles from './style.module.css'
import type { Column, SortDir } from '../../../components/ui/Table/type'
import type {
  CreateOrderDto, Order, OrderSortField, OrderStatus, PaymentStatus,
} from '../../../services/orders/orders.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 10

const statusClass: Record<OrderStatus, string> = {
  pending:   styles.stPending,
  confirmed: styles.stConfirmed,
  shipping:  styles.stShipping,
  completed: styles.stCompleted,
  cancelled: styles.stCancelled,
}
const payClass: Record<PaymentStatus, string> = {
  unpaid:  styles.payUnpaid,
  partial: styles.payPartial,
  paid:    styles.payPaid,
}

export default function Orders() {
  const { t, lang } = useLanguage()

  const [orders, setOrders] = useState<Order[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const [formOpen, setFormOpen] = useState(false)
  const [viewing, setViewing] = useState<Order | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null)

  const fmt = useMemo(() => new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])
  const dateFmt = useMemo(() => new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch, status, paymentStatus])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await ordersService.getAll({
        search: debouncedSearch || undefined,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        sortBy: (sortBy as OrderSortField) || undefined,
        sortDir: sortBy ? sortDir : undefined,
        page,
        limit: LIMIT,
      })
      setOrders(res.data)
      setMeta(res.meta)
    } catch {
      setLoadError(t.orders.loadError)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, status, paymentStatus, sortBy, sortDir, page, t.orders.loadError])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const handleSortChange = (key: string | null, dir: SortDir) => {
    setSortBy(key); setSortDir(dir); setPage(1)
  }

  const handleCreate = async (dto: CreateOrderDto) => {
    await ordersService.create(dto)
    setFormOpen(false)
    setNotice(t.orders.createSuccess)
    await fetchOrders()
  }

  const handleChangeStatus = async (newStatus: OrderStatus) => {
    if (!viewing) return
    const updated = await ordersService.updateStatus(viewing.id, newStatus)
    setViewing(updated)
    setNotice(t.orders.statusSuccess)
    await fetchOrders()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await ordersService.remove(deleteTarget.id)
    setDeleteTarget(null)
    setNotice(t.orders.deleteSuccess)
    if (orders.length === 1 && page > 1) setPage((p) => p - 1)
    else await fetchOrders()
  }

  const openView = async (o: Order) => {
    // Lấy bản đầy đủ (items + customer) để chắc chắn
    try {
      const full = await ordersService.getById(o.id)
      setViewing(full)
    } catch {
      setViewing(o)
    }
  }

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<Order>[] = [
    {
      key: 'code',
      header: t.orders.colCode,
      accessor: (o) => o.code,
      sortable: true,
      render: (o) => <span className="font-semibold text-indigo-600">{o.code}</span>,
    },
    {
      key: 'customer',
      header: t.orders.colCustomer,
      accessor: (o) => o.customer?.name,
      render: (o) => <span className="font-medium text-gray-800">{o.customer?.name ?? '—'}</span>,
    },
    {
      key: 'orderDate',
      header: t.orders.colDate,
      accessor: (o) => o.orderDate,
      sortable: true,
      render: (o) => dateFmt.format(new Date(o.orderDate)),
    },
    {
      key: 'total',
      header: t.orders.colTotal,
      accessor: (o) => o.total,
      sortable: true,
      align: 'right',
      render: (o) => <span className="font-semibold text-gray-900">{fmt.format(o.total)}</span>,
    },
    {
      key: 'status',
      header: t.orders.colStatus,
      accessor: (o) => o.status,
      sortable: true,
      render: (o) => <span className={`${styles.badge} ${statusClass[o.status]}`}>{t.orders.status[o.status]}</span>,
    },
    {
      key: 'payment',
      header: t.orders.colPayment,
      render: (o) => <span className={`${styles.badge} ${payClass[o.paymentStatus]}`}>{t.orders.payStatus[o.paymentStatus]}</span>,
    },
    {
      key: 'actions',
      header: t.orders.colActions,
      align: 'right',
      render: (o) => (
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => openView(o)} title={t.orders.viewAction}>
            <ViewIcon size={16} />
          </button>
          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => setDeleteTarget(o)} title={t.orders.deleteAction}>
            <TrashIcon size={16} />
          </button>
        </div>
      ),
    },
  ]

  const pagination = meta && meta.total > 0 && (
    <div className={styles.pagination}>
      <span className={styles.paginationInfo}>{t.orders.total}: {meta.total}</span>
      <div className={styles.paginationControls}>
        <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          <ChevronLeftIcon size={16} /> {t.orders.prev}
        </button>
        <span className={styles.pageLabel}>{t.orders.page} {meta.page} / {totalPages}</span>
        <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          {t.orders.next} <ChevronRightIcon size={16} />
        </button>
      </div>
    </div>
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t.orders.title}</h1>
          <p className={styles.pageSubtitle}>{t.orders.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={() => setFormOpen(true)} className={styles.actionBtn}>
            <PlusIcon size={16} /> {t.orders.addBtn}
          </Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.orders.searchPlaceholder}
            startIcon={<SearchIcon size={16} />}
            className="bg-white shadow-sm"
          />
        </div>
        <div className={styles.filterBox}>
          <Select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | '')}>
            <option value="">{t.orders.allStatuses}</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{t.orders.status[s]}</option>
            ))}
          </Select>
        </div>
        <div className={styles.filterBox}>
          <Select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus | '')}>
            <option value="">{t.orders.allPayments}</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{t.orders.payStatus[s]}</option>
            ))}
          </Select>
        </div>
      </div>

      {notice && <Alert type="success" message={notice} />}
      {loadError && <Alert type="error" message={loadError} />}

      <Table
        columns={columns}
        data={orders}
        rowKey={(o) => o.id}
        loading={loading}
        emptyText={t.orders.empty}
        loadingText={t.orders.loading}
        sortKey={sortBy}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        footer={pagination}
      />

      <OrderFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />

      <OrderDetailModal
        open={viewing !== null}
        order={viewing}
        onClose={() => setViewing(null)}
        onChangeStatus={handleChangeStatus}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={t.orders.deleteTitle}
        description={t.orders.deleteDesc}
        confirmLabel={t.orders.deleteConfirm}
        cancelLabel={t.orders.deleteCancel}
        variant="danger"
        icon={<TrashIcon />}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
