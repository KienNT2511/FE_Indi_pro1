import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { purchaseRequestsService } from '../../../services/purchasing/purchaseRequests.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog'
import Table from '../../../components/ui/Table/Table'
import PurchaseRequestFormModal from './PurchaseRequestFormModal'
import PurchaseRequestDetailModal from './PurchaseRequestDetailModal'
import { SearchIcon, PlusIcon, ViewIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column } from '../../../components/ui/Table/type'
import {
  PR_STATUSES,
  type CreatePurchaseRequestDto,
  type PurchaseRequest,
  type PurchaseRequestStatus,
} from '../../../services/purchasing/purchaseRequests.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 10

const STATUS_CLASS: Record<PurchaseRequestStatus, string> = {
  draft: 'badgeGray',
  submitted: 'badgeBlue',
  approved: 'badgeGreen',
  rejected: 'badgeRed',
  converted: 'badgeIndigo',
}

export default function PurchaseRequests() {
  const { t, lang } = useLanguage()
  const r = t.purchasing.requests

  const [items, setItems] = useState<PurchaseRequest[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [detail, setDetail] = useState<PurchaseRequest | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PurchaseRequest | null>(null)

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
      const res = await purchaseRequestsService.getAll({
        search: debouncedSearch || undefined,
        status: (status as PurchaseRequestStatus) || undefined,
        page,
        limit: LIMIT,
      })
      setItems(res.data)
      setMeta(res.meta)
    } catch {
      setLoadError(r.loadError)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, status, page, r.loadError])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const handleCreate = async (dto: CreatePurchaseRequestDto) => {
    await purchaseRequestsService.create(dto)
    setFormOpen(false)
    setNotice(r.createSuccess)
    setPage(1)
    await fetchData()
  }

  const openDetail = async (req: PurchaseRequest) => {
    const full = await purchaseRequestsService.getById(req.id)
    setDetail(full)
  }

  const handleChangeStatus = async (newStatus: PurchaseRequestStatus) => {
    if (!detail) return
    await purchaseRequestsService.updateStatus(detail.id, newStatus)
    setDetail(null)
    setNotice(r.statusSuccess)
    await fetchData()
  }

  const handleConvert = async (supplierId: string) => {
    if (!detail) return
    await purchaseRequestsService.convert(detail.id, supplierId)
    setDetail(null)
    setNotice(r.convertSuccess)
    await fetchData()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await purchaseRequestsService.remove(deleteTarget.id)
    setDeleteTarget(null)
    setNotice(r.deleteSuccess)
    if (items.length === 1 && page > 1) setPage((p) => p - 1)
    else await fetchData()
  }

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<PurchaseRequest>[] = [
    { key: 'code', header: r.colCode, render: (row) => <span className="font-semibold text-gray-900">{row.code}</span> },
    { key: 'date', header: r.colDate, render: (row) => fmtDate.format(new Date(row.requestDate)) },
    { key: 'by', header: r.colRequestedBy, render: (row) => row.requestedBy || <span className={styles.muted}>—</span> },
    { key: 'items', header: r.colItems, align: 'right', render: (row) => row.items?.length ?? 0 },
    { key: 'status', header: r.colStatus, render: (row) => <span className={`${styles.badge} ${styles[STATUS_CLASS[row.status]]}`}>{r.status[row.status]}</span> },
    {
      key: 'actions', header: r.colActions, align: 'right',
      render: (row) => (
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => openDetail(row)} title={r.viewAction}><ViewIcon size={16} /></button>
          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => setDeleteTarget(row)} title={r.deleteAction}><TrashIcon size={16} /></button>
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
          <h1 className={styles.pageTitle}>{r.title}</h1>
          <p className={styles.pageSubtitle}>{r.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={() => setFormOpen(true)} className={styles.actionBtn}><PlusIcon size={16} /> {r.addBtn}</Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={r.searchPlaceholder} startIcon={<SearchIcon size={16} />} className="bg-white shadow-sm" />
        </div>
        <div className={styles.filterBox}>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-white shadow-sm">
            <option value="">{t.purchasing.common.allStatuses}</option>
            {PR_STATUSES.map((st) => (<option key={st} value={st}>{r.status[st]}</option>))}
          </Select>
        </div>
      </div>

      {notice && <Alert type="success" message={notice} />}
      {loadError && <Alert type="error" message={loadError} />}

      <Table
        columns={columns}
        data={items}
        rowKey={(row) => row.id}
        loading={loading}
        emptyText={t.purchasing.common.empty}
        loadingText={t.purchasing.common.loading}
        footer={pagination}
      />

      <PurchaseRequestFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />

      <PurchaseRequestDetailModal
        open={detail !== null}
        request={detail}
        onClose={() => setDetail(null)}
        onChangeStatus={handleChangeStatus}
        onConvert={handleConvert}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={r.deleteTitle}
        description={r.deleteDesc}
        confirmLabel={r.deleteConfirm}
        cancelLabel={r.deleteCancel}
        variant="danger"
        icon={<TrashIcon />}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
