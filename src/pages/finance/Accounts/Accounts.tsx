import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { accountsService } from '../../../services/finance/accounts.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Alert from '../../../components/ui/Alert/Alert'
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog'
import Table from '../../../components/ui/Table/Table'
import AccountFormModal from './AccountFormModal'
import { SearchIcon, PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column, SortDir } from '../../../components/ui/Table/type'
import type { AccountSortField, CreateAccountDto, FinancialAccount } from '../../../services/finance/accounts.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 10

export default function Accounts() {
  const { t, lang } = useLanguage()
  const a = t.finance.accounts

  const [items, setItems] = useState<FinancialAccount[]>([])
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
  const [editing, setEditing] = useState<FinancialAccount | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FinancialAccount | null>(null)
  const [deleteError, setDeleteError] = useState('')

  const fmt = useMemo(() => new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await accountsService.getAll({
        search: debouncedSearch || undefined,
        sortBy: (sortBy as AccountSortField) || undefined,
        sortDir: sortBy ? sortDir : undefined,
        page,
        limit: LIMIT,
      })
      setItems(res.data)
      setMeta(res.meta)
    } catch {
      setLoadError(a.loadError)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, sortBy, sortDir, page, a.loadError])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const openCreate = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (item: FinancialAccount) => { setEditing(item); setFormOpen(true) }
  const handleSortChange = (key: string | null, dir: SortDir) => { setSortBy(key); setSortDir(dir); setPage(1) }

  const handleSubmit = async (dto: CreateAccountDto) => {
    if (editing) {
      await accountsService.update(editing.id, dto)
      setNotice(a.updateSuccess)
    } else {
      await accountsService.create(dto)
      setNotice(a.createSuccess)
    }
    setFormOpen(false)
    setEditing(null)
    await fetchData()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteError('')
    try {
      await accountsService.remove(deleteTarget.id)
      setDeleteTarget(null)
      setNotice(a.deleteSuccess)
      if (items.length === 1 && page > 1) setPage((p) => p - 1)
      else await fetchData()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setDeleteError(msg ?? a.saveError)
    }
  }

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<FinancialAccount>[] = [
    { key: 'code', header: a.colCode, accessor: (r) => r.code, sortable: true, render: (r) => <span className="font-semibold text-gray-900">{r.code}</span> },
    { key: 'name', header: a.colName, accessor: (r) => r.name, sortable: true, render: (r) => r.name },
    { key: 'type', header: a.colType, render: (r) => t.finance.accountType[r.type] },
    { key: 'bank', header: a.colBank, render: (r) => (r.bankName ? r.bankName : <span className={styles.muted}>—</span>) },
    { key: 'balance', header: a.colBalance, align: 'right', render: (r) => <span className="font-semibold text-gray-900">{fmt.format(r.currentBalance)}</span> },
    { key: 'status', header: a.colStatus, render: (r) => <span className={`${styles.badge} ${r.isActive ? styles.badgeGreen : styles.badgeGray}`}>{r.isActive ? a.active : a.inactive}</span> },
    {
      key: 'actions', header: a.colActions, align: 'right',
      render: (r) => (
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => openEdit(r)} title={a.editTitle}><PencilIcon size={16} /></button>
          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => { setDeleteError(''); setDeleteTarget(r) }} title={a.deleteConfirm}><TrashIcon size={16} /></button>
        </div>
      ),
    },
  ]

  const pagination = meta && meta.total > 0 && (
    <div className={styles.pagination}>
      <span className={styles.paginationInfo}>{t.finance.common.total}: {meta.total}</span>
      <div className={styles.paginationControls}>
        <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          <ChevronLeftIcon size={16} /> {t.finance.common.prev}
        </button>
        <span className={styles.pageLabel}>{t.finance.common.page} {meta.page} / {totalPages}</span>
        <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          {t.finance.common.next} <ChevronRightIcon size={16} />
        </button>
      </div>
    </div>
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{a.title}</h1>
          <p className={styles.pageSubtitle}>{a.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={openCreate} className={styles.actionBtn}><PlusIcon size={16} /> {a.addBtn}</Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={a.searchPlaceholder} startIcon={<SearchIcon size={16} />} className="bg-white shadow-sm" />
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
        emptyText={t.finance.common.empty}
        loadingText={t.finance.common.loading}
        sortKey={sortBy}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        footer={pagination}
      />

      <AccountFormModal open={formOpen} account={editing} onClose={() => { setFormOpen(false); setEditing(null) }} onSubmit={handleSubmit} />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={a.deleteTitle}
        description={a.deleteDesc}
        confirmLabel={a.deleteConfirm}
        cancelLabel={a.deleteCancel}
        variant="danger"
        icon={<TrashIcon />}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
