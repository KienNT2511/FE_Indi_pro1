import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { interactionsService } from '../../../services/sales/interactions.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog'
import Table from '../../../components/ui/Table/Table'
import InteractionFormModal from './InteractionFormModal'
import { SearchIcon, PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column } from '../../../components/ui/Table/type'
import {
  INTERACTION_TYPES,
  type CreateCustomerInteractionDto,
  type CustomerInteraction,
  type InteractionType,
} from '../../../services/sales/interactions.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 12

const TYPE_CLASS: Record<InteractionType, string> = {
  call: 'badgeBlue',
  email: 'badgeIndigo',
  meeting: 'badgeGreen',
  note: 'badgeGray',
  other: 'badgeYellow',
}

export default function CRM() {
  const { t, lang } = useLanguage()
  const c = t.sales.crm

  const [items, setItems] = useState<CustomerInteraction[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CustomerInteraction | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CustomerInteraction | null>(null)

  const fmtDate = useMemo(() => new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch, type])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await interactionsService.getAll({
        search: debouncedSearch || undefined,
        type: (type as InteractionType) || undefined,
        page,
        limit: LIMIT,
      })
      setItems(res.data)
      setMeta(res.meta)
    } catch {
      setLoadError(c.loadError)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, type, page, c.loadError])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const openCreate = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (item: CustomerInteraction) => { setEditing(item); setFormOpen(true) }

  const handleSubmit = async (dto: CreateCustomerInteractionDto) => {
    if (editing) {
      await interactionsService.update(editing.id, dto)
      setNotice(c.updateSuccess)
    } else {
      await interactionsService.create(dto)
      setNotice(c.createSuccess)
    }
    setFormOpen(false)
    setEditing(null)
    await fetchData()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await interactionsService.remove(deleteTarget.id)
    setDeleteTarget(null)
    setNotice(c.deleteSuccess)
    if (items.length === 1 && page > 1) setPage((p) => p - 1)
    else await fetchData()
  }

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<CustomerInteraction>[] = [
    { key: 'date', header: c.colDate, render: (row) => fmtDate.format(new Date(row.interactionDate)) },
    { key: 'customer', header: c.colCustomer, render: (row) => <span className="font-medium text-gray-900">{row.customer?.name ?? '—'}</span> },
    { key: 'type', header: c.colType, render: (row) => <span className={`${styles.badge} ${styles[TYPE_CLASS[row.type]]}`}>{c.type[row.type]}</span> },
    { key: 'subject', header: c.colSubject, render: (row) => row.subject },
    { key: 'followUp', header: c.colFollowUp, render: (row) => (row.nextFollowUp ? fmtDate.format(new Date(row.nextFollowUp)) : <span className={styles.muted}>—</span>) },
    {
      key: 'actions', header: c.colActions, align: 'right',
      render: (row) => (
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => openEdit(row)} title={c.editTitle}><PencilIcon size={16} /></button>
          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => setDeleteTarget(row)} title={c.deleteConfirm}><TrashIcon size={16} /></button>
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
          <h1 className={styles.pageTitle}>{c.title}</h1>
          <p className={styles.pageSubtitle}>{c.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={openCreate} className={styles.actionBtn}><PlusIcon size={16} /> {c.addBtn}</Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={c.searchPlaceholder} startIcon={<SearchIcon size={16} />} className="bg-white shadow-sm" />
        </div>
        <div className={styles.filterBox}>
          <Select value={type} onChange={(e) => setType(e.target.value)} className="bg-white shadow-sm">
            <option value="">{c.allTypes}</option>
            {INTERACTION_TYPES.map((it) => (<option key={it} value={it}>{c.type[it]}</option>))}
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
        emptyText={t.sales.common.empty}
        loadingText={t.sales.common.loading}
        footer={pagination}
      />

      <InteractionFormModal
        open={formOpen}
        interaction={editing}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={c.deleteTitle}
        description={c.deleteDesc}
        confirmLabel={c.deleteConfirm}
        cancelLabel={c.deleteCancel}
        variant="danger"
        icon={<TrashIcon />}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
