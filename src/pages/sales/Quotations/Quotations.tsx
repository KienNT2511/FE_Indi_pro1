import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { quotationsService } from '../../../services/sales/quotations.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog'
import Table from '../../../components/ui/Table/Table'
import QuotationFormModal from './QuotationFormModal'
import QuotationDetailModal from './QuotationDetailModal'
import { SearchIcon, PlusIcon, ViewIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column } from '../../../components/ui/Table/type'
import {
  QUOTATION_STATUSES,
  type CreateQuotationDto,
  type Quotation,
  type QuotationStatus,
} from '../../../services/sales/quotations.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 10

const STATUS_CLASS: Record<QuotationStatus, string> = {
  draft: 'badgeGray',
  sent: 'badgeBlue',
  accepted: 'badgeGreen',
  rejected: 'badgeRed',
  converted: 'badgeIndigo',
}

export default function Quotations() {
  const { t, lang } = useLanguage()
  const q = t.sales.quotations

  const [items, setItems] = useState<Quotation[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [detail, setDetail] = useState<Quotation | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Quotation | null>(null)

  const fmt = useMemo(() => new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])
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
      const res = await quotationsService.getAll({
        search: debouncedSearch || undefined,
        status: (status as QuotationStatus) || undefined,
        page,
        limit: LIMIT,
      })
      setItems(res.data)
      setMeta(res.meta)
    } catch {
      setLoadError(q.loadError)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, status, page, q.loadError])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const handleCreate = async (dto: CreateQuotationDto) => {
    await quotationsService.create(dto)
    setFormOpen(false)
    setNotice(q.createSuccess)
    setPage(1)
    await fetchData()
  }

  const openDetail = async (item: Quotation) => {
    const full = await quotationsService.getById(item.id)
    setDetail(full)
  }

  const handleChangeStatus = async (newStatus: QuotationStatus) => {
    if (!detail) return
    await quotationsService.updateStatus(detail.id, newStatus)
    setDetail(null)
    setNotice(q.statusSuccess)
    await fetchData()
  }

  const handleConvert = async () => {
    if (!detail) return
    await quotationsService.convert(detail.id)
    setDetail(null)
    setNotice(q.convertSuccess)
    await fetchData()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await quotationsService.remove(deleteTarget.id)
    setDeleteTarget(null)
    setNotice(q.deleteSuccess)
    if (items.length === 1 && page > 1) setPage((p) => p - 1)
    else await fetchData()
  }

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<Quotation>[] = [
    { key: 'code', header: q.colCode, render: (r) => <span className="font-semibold text-gray-900">{r.code}</span> },
    { key: 'customer', header: q.colCustomer, render: (r) => r.customer?.name ?? '—' },
    { key: 'date', header: q.colDate, render: (r) => fmtDate.format(new Date(r.quoteDate)) },
    { key: 'total', header: q.colTotal, align: 'right', render: (r) => <span className="font-medium text-gray-900">{fmt.format(r.total)}</span> },
    { key: 'status', header: q.colStatus, render: (r) => <span className={`${styles.badge} ${styles[STATUS_CLASS[r.status]]}`}>{q.status[r.status]}</span> },
    {
      key: 'actions', header: q.colActions, align: 'right',
      render: (r) => (
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => openDetail(r)} title={q.viewAction}><ViewIcon size={16} /></button>
          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => setDeleteTarget(r)} title={q.deleteAction}><TrashIcon size={16} /></button>
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
          <h1 className={styles.pageTitle}>{q.title}</h1>
          <p className={styles.pageSubtitle}>{q.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={() => setFormOpen(true)} className={styles.actionBtn}><PlusIcon size={16} /> {q.addBtn}</Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={q.searchPlaceholder} startIcon={<SearchIcon size={16} />} className="bg-white shadow-sm" />
        </div>
        <div className={styles.filterBox}>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-white shadow-sm">
            <option value="">{t.sales.common.allStatuses}</option>
            {QUOTATION_STATUSES.map((st) => (<option key={st} value={st}>{q.status[st]}</option>))}
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
        emptyText={t.sales.common.empty}
        loadingText={t.sales.common.loading}
        footer={pagination}
      />

      <QuotationFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />

      <QuotationDetailModal
        open={detail !== null}
        quotation={detail}
        onClose={() => setDetail(null)}
        onChangeStatus={handleChangeStatus}
        onConvert={handleConvert}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={q.deleteTitle}
        description={q.deleteDesc}
        confirmLabel={q.deleteConfirm}
        cancelLabel={q.deleteCancel}
        variant="danger"
        icon={<TrashIcon />}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
