import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { stockDocsService } from '../../../services/inventory/stockDocs.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog'
import Table from '../../../components/ui/Table/Table'
import StockDocFormModal from './StockDocFormModal'
import StockDocDetailModal from './StockDocDetailModal'
import { SearchIcon, PlusIcon, ViewIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column } from '../../../components/ui/Table/type'
import type { StockDocsPageProps } from './type'
import {
  STOCK_DOC_STATUSES,
  type CreateStockDocDto,
  type StockDoc,
  type StockDocStatus,
} from '../../../services/inventory/stockDocs.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 10

export default function StockDocs({ docType }: StockDocsPageProps) {
  const { t, lang } = useLanguage()
  const d = t.inventory.docs
  const typeText = d[docType]
  const isTransfer = docType === 'transfer'

  const [items, setItems] = useState<StockDoc[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [detail, setDetail] = useState<StockDoc | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StockDoc | null>(null)

  const fmtDate = useMemo(() => new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  // Đổi loại chứng từ (điều hướng giữa nhập/xuất/...) → reset bộ lọc
  useEffect(() => { setPage(1); setSearch(''); setDebouncedSearch(''); setStatus('') }, [docType])
  useEffect(() => { setPage(1) }, [debouncedSearch, status])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await stockDocsService.getAll({
        type: docType,
        search: debouncedSearch || undefined,
        status: (status as StockDocStatus) || undefined,
        page,
        limit: LIMIT,
      })
      setItems(res.data)
      setMeta(res.meta)
    } catch {
      setLoadError(d.loadError)
    } finally {
      setLoading(false)
    }
  }, [docType, debouncedSearch, status, page, d.loadError])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const handleCreate = async (dto: CreateStockDocDto) => {
    await stockDocsService.create(dto)
    setFormOpen(false)
    setNotice(d.createSuccess)
    setPage(1)
    await fetchData()
  }

  const openDetail = async (doc: StockDoc) => {
    // tải bản đầy đủ kèm items
    const full = await stockDocsService.getById(doc.id)
    setDetail(full)
  }

  const handleCancel = async () => {
    if (!detail) return
    await stockDocsService.cancel(detail.id)
    setDetail(null)
    setNotice(d.cancelSuccess)
    await fetchData()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await stockDocsService.remove(deleteTarget.id)
    setDeleteTarget(null)
    setNotice(d.deleteSuccess)
    if (items.length === 1 && page > 1) setPage((p) => p - 1)
    else await fetchData()
  }

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<StockDoc>[] = [
    { key: 'code', header: d.colCode, render: (r) => <span className="font-semibold text-gray-900">{r.code}</span> },
    { key: 'date', header: d.colDate, render: (r) => fmtDate.format(new Date(r.date)) },
    { key: 'warehouse', header: d.colWarehouse, render: (r) => r.warehouse?.name ?? '—' },
    ...(isTransfer
      ? [{ key: 'counter', header: d.colCounter, render: (r: StockDoc) => r.counterWarehouse?.name ?? '—' }]
      : [{ key: 'partner', header: d.colPartner, render: (r: StockDoc) => r.partnerName || <span className={styles.muted}>—</span> }]),
    { key: 'items', header: d.colItems, align: 'right', render: (r) => r.items?.length ?? 0 },
    {
      key: 'status', header: d.colStatus,
      render: (r) => (
        <span className={`${styles.badge} ${r.status === 'posted' ? styles.badgeGreen : styles.badgeGray}`}>{d.status[r.status]}</span>
      ),
    },
    {
      key: 'actions', header: d.colActions, align: 'right',
      render: (r) => (
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => openDetail(r)} title={d.viewAction}><ViewIcon size={16} /></button>
          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => setDeleteTarget(r)} title={d.deleteAction}><TrashIcon size={16} /></button>
        </div>
      ),
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
          <h1 className={styles.pageTitle}>{typeText.title}</h1>
          <p className={styles.pageSubtitle}>{typeText.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={() => setFormOpen(true)} className={styles.actionBtn}><PlusIcon size={16} /> {typeText.addBtn}</Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={d.searchPlaceholder} startIcon={<SearchIcon size={16} />} className="bg-white shadow-sm" />
        </div>
        <div className={styles.filterBox}>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-white shadow-sm">
            <option value="">{d.allStatuses}</option>
            {STOCK_DOC_STATUSES.map((st) => (<option key={st} value={st}>{d.status[st]}</option>))}
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
        emptyText={t.inventory.common.empty}
        loadingText={t.inventory.common.loading}
        footer={pagination}
      />

      <StockDocFormModal
        open={formOpen}
        docType={docType}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />

      <StockDocDetailModal
        open={detail !== null}
        doc={detail}
        onClose={() => setDetail(null)}
        onCancelDoc={handleCancel}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={d.deleteTitle}
        description={d.deleteDesc}
        confirmLabel={d.deleteConfirm}
        cancelLabel={d.deleteCancel}
        variant="danger"
        icon={<TrashIcon />}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
