import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { deliveriesService } from '../../../services/sales/deliveries.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Alert from '../../../components/ui/Alert/Alert'
import Table from '../../../components/ui/Table/Table'
import DeliveryFormModal from './DeliveryFormModal'
import DeliveryDetailModal from './DeliveryDetailModal'
import { SearchIcon, PlusIcon, ViewIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Column } from '../../../components/ui/Table/type'
import type { CreateDeliveryDto, Delivery } from '../../../services/sales/deliveries.types'
import type { PaginationMeta } from '../../../services/common.types'

const LIMIT = 10

export default function Deliveries() {
  const { t, lang } = useLanguage()
  const d = t.sales.deliveries

  const [items, setItems] = useState<Delivery[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [detail, setDetail] = useState<Delivery | null>(null)

  const fmtDate = useMemo(() => new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => { setPage(1) }, [debouncedSearch])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await deliveriesService.getAll({ search: debouncedSearch || undefined, page, limit: LIMIT })
      setItems(res.data)
      setMeta(res.meta)
    } catch {
      setLoadError(d.loadError)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, page, d.loadError])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const handleCreate = async (dto: CreateDeliveryDto) => {
    await deliveriesService.create(dto)
    setFormOpen(false)
    setNotice(d.createSuccess)
    setPage(1)
    await fetchData()
  }

  const openDetail = async (item: Delivery) => {
    const full = await deliveriesService.getById(item.id)
    setDetail(full)
  }

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<Delivery>[] = [
    { key: 'code', header: d.colCode, render: (r) => <span className="font-semibold text-gray-900">{r.code}</span> },
    { key: 'order', header: d.colOrder, render: (r) => r.order?.code ?? '—' },
    { key: 'warehouse', header: d.colWarehouse, render: (r) => r.warehouse?.name ?? '—' },
    { key: 'date', header: d.colDate, render: (r) => fmtDate.format(new Date(r.deliveryDate)) },
    { key: 'items', header: d.colItems, align: 'right', render: (r) => r.items?.length ?? 0 },
    {
      key: 'actions', header: d.colActions, align: 'right',
      render: (r) => (
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => openDetail(r)} title={d.viewAction}><ViewIcon size={16} /></button>
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
          <h1 className={styles.pageTitle}>{d.title}</h1>
          <p className={styles.pageSubtitle}>{d.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={() => setFormOpen(true)} className={styles.actionBtn}><PlusIcon size={16} /> {d.addBtn}</Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={d.searchPlaceholder} startIcon={<SearchIcon size={16} />} className="bg-white shadow-sm" />
        </div>
      </div>

      {notice && <Alert type="success" message={notice} />}
      {loadError && <Alert type="error" message={loadError} />}

      <Table
        columns={columns}
        data={items}
        rowKey={(r) => r.id}
        loading={loading}
        emptyText={t.sales.common.empty}
        loadingText={t.sales.common.loading}
        footer={pagination}
      />

      <DeliveryFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />
      <DeliveryDetailModal open={detail !== null} delivery={detail} onClose={() => setDetail(null)} />
    </div>
  )
}
