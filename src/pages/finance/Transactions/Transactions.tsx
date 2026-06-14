import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { transactionsService } from '../../../services/finance/transactions.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog'
import Table from '../../../components/ui/Table/Table'
import TransactionFormModal from './TransactionFormModal'
import { SearchIcon, ArrowDownIcon, ArrowUpIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column } from '../../../components/ui/Table/type'
import {
  TRANSACTION_TYPES,
  type CreateTransactionDto,
  type Transaction,
  type TransactionType,
} from '../../../services/finance/transactions.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 12

export default function Transactions() {
  const { t, lang } = useLanguage()
  const tr = t.finance.transactions

  const [items, setItems] = useState<Transaction[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)

  const [formType, setFormType] = useState<TransactionType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)

  const fmt = useMemo(() => new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])
  const fmtDate = useMemo(() => new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch, typeFilter])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await transactionsService.getAll({
        search: debouncedSearch || undefined,
        type: (typeFilter as TransactionType) || undefined,
        page,
        limit: LIMIT,
      })
      setItems(res.data)
      setMeta(res.meta)
    } catch {
      setLoadError(tr.loadError)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, typeFilter, page, tr.loadError])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const handleCreate = async (dto: CreateTransactionDto) => {
    await transactionsService.create(dto)
    setFormType(null)
    setNotice(tr.createSuccess)
    setPage(1)
    await fetchData()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await transactionsService.remove(deleteTarget.id)
    setDeleteTarget(null)
    setNotice(tr.deleteSuccess)
    if (items.length === 1 && page > 1) setPage((p) => p - 1)
    else await fetchData()
  }

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<Transaction>[] = [
    { key: 'code', header: tr.colCode, render: (r) => <span className="font-semibold text-gray-900">{r.code}</span> },
    { key: 'date', header: tr.colDate, render: (r) => fmtDate.format(new Date(r.date)) },
    { key: 'type', header: tr.colType, render: (r) => <span className={`${styles.badge} ${r.type === 'receipt' ? styles.badgeGreen : styles.badgeRed}`}>{t.finance.type[r.type]}</span> },
    { key: 'category', header: tr.colCategory, render: (r) => t.finance.category[r.category] },
    { key: 'account', header: tr.colAccount, render: (r) => r.account?.name ?? '—' },
    { key: 'partner', header: tr.colPartner, render: (r) => (r.partnerName ? r.partnerName : <span className={styles.muted}>—</span>) },
    { key: 'amount', header: tr.colAmount, align: 'right', render: (r) => <span className={r.type === 'receipt' ? styles.posNum : styles.negNum}>{r.type === 'receipt' ? '+' : '-'}{fmt.format(r.amount)}</span> },
    {
      key: 'actions', header: tr.colActions, align: 'right',
      render: (r) => (
        <div className={styles.actions}>
          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => setDeleteTarget(r)} title={tr.deleteConfirm}><TrashIcon size={16} /></button>
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
          <h1 className={styles.pageTitle}>{tr.title}</h1>
          <p className={styles.pageSubtitle}>{tr.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" onClick={() => setFormType('receipt')} className="w-auto px-4 gap-2"><ArrowDownIcon size={16} /> {tr.receiptBtn}</Button>
          <Button onClick={() => setFormType('payment')} className="w-auto px-4 gap-2"><ArrowUpIcon size={16} /> {tr.paymentBtn}</Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tr.searchPlaceholder} startIcon={<SearchIcon size={16} />} className="bg-white shadow-sm" />
        </div>
        <div className={styles.filterBox}>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-white shadow-sm">
            <option value="">{t.finance.common.allTypes}</option>
            {TRANSACTION_TYPES.map((tp) => (<option key={tp} value={tp}>{t.finance.type[tp]}</option>))}
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
        emptyText={t.finance.common.empty}
        loadingText={t.finance.common.loading}
        footer={pagination}
      />

      <TransactionFormModal open={formType !== null} type={formType ?? 'receipt'} onClose={() => setFormType(null)} onSubmit={handleCreate} />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={tr.deleteTitle}
        description={tr.deleteDesc}
        confirmLabel={tr.deleteConfirm}
        cancelLabel={tr.deleteCancel}
        variant="danger"
        icon={<TrashIcon />}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
