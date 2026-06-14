import { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { customersService } from '../../../services/customers/customers.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Alert from '../../../components/ui/Alert/Alert'
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog'
import Table from '../../../components/ui/Table/Table'
import CustomerFormModal from './CustomerFormModal'
import { SearchIcon, PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column, SortDir } from '../../../components/ui/Table/type'
import type { CreateCustomerDto, Customer, CustomerSortField } from '../../../services/customers/customers.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 10

export default function Customers() {
  const { t } = useLanguage()

  const [customers, setCustomers] = useState<Customer[]>([])
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
  const [editing, setEditing] = useState<Customer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch])

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await customersService.getAll({
        search: debouncedSearch || undefined,
        sortBy: (sortBy as CustomerSortField) || undefined,
        sortDir: sortBy ? sortDir : undefined,
        page,
        limit: LIMIT,
      })
      setCustomers(res.data)
      setMeta(res.meta)
    } catch {
      setLoadError(t.customers.loadError)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, sortBy, sortDir, page, t.customers.loadError])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const openCreate = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (c: Customer) => { setEditing(c); setFormOpen(true) }

  const handleSortChange = (key: string | null, dir: SortDir) => {
    setSortBy(key)
    setSortDir(dir)
    setPage(1)
  }

  const handleSubmit = async (dto: CreateCustomerDto) => {
    if (editing) {
      await customersService.update(editing.id, dto)
      setNotice(t.customers.updateSuccess)
    } else {
      await customersService.create(dto)
      setNotice(t.customers.createSuccess)
    }
    setFormOpen(false)
    setEditing(null)
    await fetchCustomers()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await customersService.remove(deleteTarget.id)
    setDeleteTarget(null)
    setNotice(t.customers.deleteSuccess)
    if (customers.length === 1 && page > 1) setPage((p) => p - 1)
    else await fetchCustomers()
  }

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: t.customers.colName,
      accessor: (c) => c.name,
      sortable: true,
      searchable: true,
      render: (c) => <span className="font-semibold text-gray-900">{c.name}</span>,
    },
    {
      key: 'phone',
      header: t.customers.colPhone,
      accessor: (c) => c.phone,
      sortable: true,
      searchable: true,
      render: (c) => (c.phone ? c.phone : <span className="text-gray-400">—</span>),
    },
    {
      key: 'email',
      header: t.customers.colEmail,
      accessor: (c) => c.email,
      searchable: true,
      render: (c) => (c.email ? c.email : <span className="text-gray-400">—</span>),
    },
    {
      key: 'address',
      header: t.customers.colAddress,
      accessor: (c) => c.address,
      render: (c) => (c.address ? c.address : <span className="text-gray-400">—</span>),
    },
    {
      key: 'actions',
      header: t.customers.colActions,
      align: 'right',
      render: (c) => (
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => openEdit(c)} title={t.customers.editTitle}>
            <PencilIcon size={16} />
          </button>
          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => setDeleteTarget(c)} title={t.customers.deleteConfirm}>
            <TrashIcon size={16} />
          </button>
        </div>
      ),
    },
  ]

  const pagination = meta && meta.total > 0 && (
    <div className={styles.pagination}>
      <span className={styles.paginationInfo}>{t.customers.total}: {meta.total}</span>
      <div className={styles.paginationControls}>
        <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          <ChevronLeftIcon size={16} /> {t.customers.prev}
        </button>
        <span className={styles.pageLabel}>{t.customers.page} {meta.page} / {totalPages}</span>
        <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          {t.customers.next} <ChevronRightIcon size={16} />
        </button>
      </div>
    </div>
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t.customers.title}</h1>
          <p className={styles.pageSubtitle}>{t.customers.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={openCreate} className={styles.actionBtn}>
            <PlusIcon size={16} /> {t.customers.addBtn}
          </Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.customers.searchPlaceholder}
            startIcon={<SearchIcon size={16} />}
            className="bg-white shadow-sm"
          />
        </div>
      </div>

      {notice && <Alert type="success" message={notice} />}
      {loadError && <Alert type="error" message={loadError} />}

      <Table
        columns={columns}
        data={customers}
        rowKey={(c) => c.id}
        loading={loading}
        emptyText={t.customers.empty}
        loadingText={t.customers.loading}
        searchPlaceholder={t.customers.filterPlaceholder}
        sortKey={sortBy}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        footer={pagination}
      />

      <CustomerFormModal
        open={formOpen}
        customer={editing}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={t.customers.deleteTitle}
        description={t.customers.deleteDesc}
        confirmLabel={t.customers.deleteConfirm}
        cancelLabel={t.customers.deleteCancel}
        variant="danger"
        icon={<TrashIcon />}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
