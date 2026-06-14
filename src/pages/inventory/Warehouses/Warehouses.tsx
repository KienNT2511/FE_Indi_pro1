import { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { warehousesService } from '../../../services/inventory/warehouses.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Alert from '../../../components/ui/Alert/Alert'
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog'
import Table from '../../../components/ui/Table/Table'
import WarehouseFormModal from './WarehouseFormModal'
import { SearchIcon, PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column, SortDir } from '../../../components/ui/Table/type'
import type { CreateWarehouseDto, Warehouse, WarehouseSortField } from '../../../services/inventory/warehouses.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 10

export default function Warehouses() {
  const { t } = useLanguage()
  const w = t.inventory.warehouses

  const [items, setItems] = useState<Warehouse[]>([])
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
  const [editing, setEditing] = useState<Warehouse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Warehouse | null>(null)
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
      const res = await warehousesService.getAll({
        search: debouncedSearch || undefined,
        sortBy: (sortBy as WarehouseSortField) || undefined,
        sortDir: sortBy ? sortDir : undefined,
        page,
        limit: LIMIT,
      })
      setItems(res.data)
      setMeta(res.meta)
    } catch {
      setLoadError(w.loadError)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, sortBy, sortDir, page, w.loadError])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const openCreate = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (item: Warehouse) => { setEditing(item); setFormOpen(true) }

  const handleSortChange = (key: string | null, dir: SortDir) => {
    setSortBy(key); setSortDir(dir); setPage(1)
  }

  const handleSubmit = async (dto: CreateWarehouseDto) => {
    if (editing) {
      await warehousesService.update(editing.id, dto)
      setNotice(w.updateSuccess)
    } else {
      await warehousesService.create(dto)
      setNotice(w.createSuccess)
    }
    setFormOpen(false)
    setEditing(null)
    await fetchData()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteError('')
    try {
      await warehousesService.remove(deleteTarget.id)
      setDeleteTarget(null)
      setNotice(w.deleteSuccess)
      if (items.length === 1 && page > 1) setPage((p) => p - 1)
      else await fetchData()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setDeleteError(msg ?? w.saveError)
    }
  }

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<Warehouse>[] = [
    {
      key: 'code', header: w.colCode, accessor: (r) => r.code, sortable: true,
      render: (r) => <span className="font-semibold text-gray-900">{r.code}</span>,
    },
    { key: 'name', header: w.colName, accessor: (r) => r.name, sortable: true, render: (r) => r.name },
    {
      key: 'address', header: w.colAddress, accessor: (r) => r.address,
      render: (r) => (r.address ? r.address : <span className={styles.muted}>—</span>),
    },
    {
      key: 'status', header: w.colStatus,
      render: (r) => (
        <span className={`${styles.badge} ${r.isActive ? styles.badgeGreen : styles.badgeGray}`}>
          {r.isActive ? w.active : w.inactive}
        </span>
      ),
    },
    {
      key: 'actions', header: w.colActions, align: 'right',
      render: (r) => (
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => openEdit(r)} title={w.editTitle}><PencilIcon size={16} /></button>
          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => { setDeleteError(''); setDeleteTarget(r) }} title={w.deleteConfirm}><TrashIcon size={16} /></button>
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
          <h1 className={styles.pageTitle}>{w.title}</h1>
          <p className={styles.pageSubtitle}>{w.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={openCreate} className={styles.actionBtn}><PlusIcon size={16} /> {w.addBtn}</Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={w.searchPlaceholder} startIcon={<SearchIcon size={16} />} className="bg-white shadow-sm" />
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
        emptyText={t.inventory.common.empty}
        loadingText={t.inventory.common.loading}
        sortKey={sortBy}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        footer={pagination}
      />

      <WarehouseFormModal
        open={formOpen}
        warehouse={editing}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={w.deleteTitle}
        description={w.deleteDesc}
        confirmLabel={w.deleteConfirm}
        cancelLabel={w.deleteCancel}
        variant="danger"
        icon={<TrashIcon />}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
