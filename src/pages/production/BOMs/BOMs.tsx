import { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { bomsService } from '../../../services/production/boms.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Alert from '../../../components/ui/Alert/Alert'
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog'
import Table from '../../../components/ui/Table/Table'
import BomFormModal from './BomFormModal'
import { SearchIcon, PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column, SortDir } from '../../../components/ui/Table/type'
import type { BillOfMaterials, BomSortField, CreateBomDto } from '../../../services/production/boms.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 10

export default function BOMs() {
  const { t } = useLanguage()
  const b = t.production.boms

  const [items, setItems] = useState<BillOfMaterials[]>([])
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
  const [editing, setEditing] = useState<BillOfMaterials | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BillOfMaterials | null>(null)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await bomsService.getAll({
        search: debouncedSearch || undefined,
        sortBy: (sortBy as BomSortField) || undefined,
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
  }, [debouncedSearch, sortBy, sortDir, page, b.loadError])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const openCreate = () => { setEditing(null); setFormOpen(true) }
  const openEdit = async (item: BillOfMaterials) => {
    const full = await bomsService.getById(item.id)
    setEditing(full)
    setFormOpen(true)
  }

  const handleSortChange = (key: string | null, dir: SortDir) => { setSortBy(key); setSortDir(dir); setPage(1) }

  const handleSubmit = async (dto: CreateBomDto) => {
    if (editing) {
      await bomsService.update(editing.id, dto)
      setNotice(b.updateSuccess)
    } else {
      await bomsService.create(dto)
      setNotice(b.createSuccess)
    }
    setFormOpen(false)
    setEditing(null)
    await fetchData()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await bomsService.remove(deleteTarget.id)
    setDeleteTarget(null)
    setNotice(b.deleteSuccess)
    if (items.length === 1 && page > 1) setPage((p) => p - 1)
    else await fetchData()
  }

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<BillOfMaterials>[] = [
    { key: 'code', header: b.colCode, accessor: (r) => r.code, sortable: true, render: (r) => <span className="font-semibold text-gray-900">{r.code}</span> },
    { key: 'name', header: b.colName, accessor: (r) => r.name, sortable: true, render: (r) => r.name },
    { key: 'product', header: b.colProduct, render: (r) => r.product?.name ?? '—' },
    { key: 'items', header: b.colItems, align: 'right', render: (r) => r.items?.length ?? 0 },
    { key: 'status', header: b.colStatus, render: (r) => <span className={`${styles.badge} ${r.isActive ? styles.badgeGreen : styles.badgeGray}`}>{r.isActive ? b.active : b.inactive}</span> },
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
        sortKey={sortBy}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        footer={pagination}
      />

      <BomFormModal open={formOpen} bom={editing} onClose={() => { setFormOpen(false); setEditing(null) }} onSubmit={handleSubmit} />

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
