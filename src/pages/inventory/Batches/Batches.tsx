import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { batchesService } from '../../../services/inventory/batches.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog'
import Table from '../../../components/ui/Table/Table'
import BatchFormModal from './BatchFormModal'
import { SearchIcon, PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column, SortDir } from '../../../components/ui/Table/type'
import type { Batch, BatchSortField, CreateBatchDto } from '../../../services/inventory/batches.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 10

// 'expired' | 'soon' | 'valid' | 'none'
const expiryStatus = (expiryDate: string | null): 'expired' | 'soon' | 'valid' | 'none' => {
  if (!expiryDate) return 'none'
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const exp = new Date(expiryDate); exp.setHours(0, 0, 0, 0)
  const diffDays = Math.round((exp.getTime() - today.getTime()) / 86_400_000)
  if (diffDays < 0) return 'expired'
  if (diffDays <= 30) return 'soon'
  return 'valid'
}

export default function Batches() {
  const { t, lang } = useLanguage()
  const b = t.inventory.batches

  const [items, setItems] = useState<Batch[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [expiringInDays, setExpiringInDays] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Batch | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Batch | null>(null)

  const fmtDate = useMemo(() => new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])
  const showDate = (d: string | null) => (d ? fmtDate.format(new Date(d)) : '—')

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch, expiringInDays])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await batchesService.getAll({
        search: debouncedSearch || undefined,
        expiringInDays: expiringInDays ? Number(expiringInDays) : undefined,
        sortBy: (sortBy as BatchSortField) || undefined,
        sortDir: sortBy ? sortDir : undefined,
        page,
        limit: LIMIT,
      })
      setItems(res.data)
      setMeta(res.meta)
    } catch {
      setLoadError(b.loadError)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, expiringInDays, sortBy, sortDir, page, b.loadError])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const openCreate = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (item: Batch) => { setEditing(item); setFormOpen(true) }

  const handleSortChange = (key: string | null, dir: SortDir) => { setSortBy(key); setSortDir(dir); setPage(1) }

  const handleSubmit = async (dto: CreateBatchDto) => {
    if (editing) {
      await batchesService.update(editing.id, dto)
      setNotice(b.updateSuccess)
    } else {
      await batchesService.create(dto)
      setNotice(b.createSuccess)
    }
    setFormOpen(false)
    setEditing(null)
    await fetchData()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await batchesService.remove(deleteTarget.id)
    setDeleteTarget(null)
    setNotice(b.deleteSuccess)
    if (items.length === 1 && page > 1) setPage((p) => p - 1)
    else await fetchData()
  }

  const totalPages = meta?.totalPages ?? 1

  const statusBadge = (batch: Batch) => {
    const st = expiryStatus(batch.expiryDate)
    const map = {
      expired: { cls: styles.badgeRed, label: b.statusExpired },
      soon: { cls: styles.badgeYellow, label: b.statusSoon },
      valid: { cls: styles.badgeGreen, label: b.statusValid },
      none: { cls: styles.badgeGray, label: b.noExpiry },
    }[st]
    return <span className={`${styles.badge} ${map.cls}`}>{map.label}</span>
  }

  const columns: Column<Batch>[] = [
    {
      key: 'code', header: b.colCode, accessor: (r) => r.code, sortable: true,
      render: (r) => <span className="font-semibold text-gray-900">{r.code}</span>,
    },
    { key: 'product', header: b.colProduct, render: (r) => r.product?.name ?? <span className={styles.muted}>—</span> },
    { key: 'mfg', header: b.colMfg, render: (r) => showDate(r.manufactureDate) },
    { key: 'expiry', header: b.colExpiry, accessor: (r) => r.expiryDate, sortable: true, render: (r) => showDate(r.expiryDate) },
    { key: 'status', header: b.colStatus, render: (r) => statusBadge(r) },
    {
      key: 'actions', header: b.colActions, align: 'right',
      render: (r) => (
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => openEdit(r)} title={b.editTitle}><PencilIcon size={16} /></button>
          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => setDeleteTarget(r)} title={b.deleteConfirm}><TrashIcon size={16} /></button>
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
          <h1 className={styles.pageTitle}>{b.title}</h1>
          <p className={styles.pageSubtitle}>{b.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={openCreate} className={styles.actionBtn}><PlusIcon size={16} /> {b.addBtn}</Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={b.searchPlaceholder} startIcon={<SearchIcon size={16} />} className="bg-white shadow-sm" />
        </div>
        <div className={styles.filterBox}>
          <Select value={expiringInDays} onChange={(e) => setExpiringInDays(e.target.value)} className="bg-white shadow-sm">
            <option value="">{b.allBatches}</option>
            <option value="7">{b.expiring7}</option>
            <option value="30">{b.expiring30}</option>
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
        sortKey={sortBy}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        footer={pagination}
      />

      <BatchFormModal
        open={formOpen}
        batch={editing}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={b.deleteTitle}
        description={b.deleteDesc}
        confirmLabel={b.deleteConfirm}
        cancelLabel={b.deleteCancel}
        variant="danger"
        icon={<TrashIcon />}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
