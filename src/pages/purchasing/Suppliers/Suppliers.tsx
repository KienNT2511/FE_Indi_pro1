import { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { suppliersService } from '../../../services/purchasing/suppliers.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Alert from '../../../components/ui/Alert/Alert'
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog'
import Table from '../../../components/ui/Table/Table'
import SupplierFormModal from './SupplierFormModal'
import { SearchIcon, PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column, SortDir } from '../../../components/ui/Table/type'
import type { CreateSupplierDto, Supplier, SupplierSortField } from '../../../services/purchasing/suppliers.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 10

export default function Suppliers() {
  const { t } = useLanguage()
  const s = t.purchasing.suppliers

  const [items, setItems] = useState<Supplier[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await suppliersService.getAll({
        search: debouncedSearch || undefined,
        sortBy: (sortBy as SupplierSortField) || undefined,
        sortDir: sortBy ? sortDir : undefined,
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
  }, [debouncedSearch, sortBy, sortDir, page, s.loadError])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const openCreate = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (item: Supplier) => { setEditing(item); setFormOpen(true) }

  const handleSortChange = (key: string | null, dir: SortDir) => { setSortBy(key); setSortDir(dir); setPage(1) }

  const handleSubmit = async (dto: CreateSupplierDto) => {
    if (editing) {
      await suppliersService.update(editing.id, dto)
      setNotice(s.updateSuccess)
    } else {
      await suppliersService.create(dto)
      setNotice(s.createSuccess)
    }
    setFormOpen(false)
    setEditing(null)
    await fetchData()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteError('')
    try {
      await suppliersService.remove(deleteTarget.id)
      setDeleteTarget(null)
      setNotice(s.deleteSuccess)
      if (items.length === 1 && page > 1) setPage((p) => p - 1)
      else await fetchData()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setDeleteError(msg ?? s.saveError)
    }
  }

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<Supplier>[] = [
    {
      key: 'name', header: s.colName, accessor: (r) => r.name, sortable: true,
      render: (r) => <span className="font-semibold text-gray-900">{r.name}</span>,
    },
    { key: 'phone', header: s.colPhone, accessor: (r) => r.phone, sortable: true, render: (r) => (r.phone ? r.phone : <span className={styles.muted}>—</span>) },
    { key: 'email', header: s.colEmail, render: (r) => (r.email ? r.email : <span className={styles.muted}>—</span>) },
    { key: 'taxCode', header: s.colTaxCode, render: (r) => (r.taxCode ? r.taxCode : <span className={styles.muted}>—</span>) },
    {
      key: 'actions', header: s.colActions, align: 'right',
      render: (r) => (
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => openEdit(r)} title={s.editTitle}><PencilIcon size={16} /></button>
          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => { setDeleteError(''); setDeleteTarget(r) }} title={s.deleteConfirm}><TrashIcon size={16} /></button>
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
          <h1 className={styles.pageTitle}>{s.title}</h1>
          <p className={styles.pageSubtitle}>{s.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={openCreate} className={styles.actionBtn}><PlusIcon size={16} /> {s.addBtn}</Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={s.searchPlaceholder} startIcon={<SearchIcon size={16} />} className="bg-white shadow-sm" />
        </div>
      </div>

      {notice && <Alert type="success" message={notice} />}
      {loadError && <Alert type="error" message={loadError} />}
      {deleteError && <Alert type="error" message={deleteError} />}

      <Table
        columns={columns}
        data={items}
        rowKey={(r) => r.id}
        loading={loading}
        emptyText={t.purchasing.common.empty}
        loadingText={t.purchasing.common.loading}
        sortKey={sortBy}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        footer={pagination}
      />

      <SupplierFormModal
        open={formOpen}
        supplier={editing}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={s.deleteTitle}
        description={s.deleteDesc}
        confirmLabel={s.deleteConfirm}
        cancelLabel={s.deleteCancel}
        variant="danger"
        icon={<TrashIcon />}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
