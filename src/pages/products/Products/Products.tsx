import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { productsService } from '../../../services/products/products.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog'
import Table from '../../../components/ui/Table/Table'
import ProductFormModal from './ProductFormModal'
import ImportModal from './ImportModal'
import {
  SearchIcon, PlusIcon, UploadIcon, PencilIcon, TrashIcon,
  ChevronLeftIcon, ChevronRightIcon,
} from '../../../assets/icons'
import styles from './style.module.css'
import type { Column, SortDir } from '../../../components/ui/Table/type'
import type { CreateProductDto, PaginationMeta, Product, ProductSortField } from '../../../services/products/products.types'

const LIMIT = 10

export default function Products() {
  const { t, lang } = useLanguage()

  const [products, setProducts] = useState<Product[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  // Tích luỹ danh sách phân loại đã gặp để làm bộ lọc (backend chưa có endpoint riêng)
  const [categories, setCategories] = useState<string[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const priceFormatter = useMemo(
    () => new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US'),
    [lang],
  )

  // Debounce ô tìm kiếm
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(id)
  }, [search])

  // Về trang 1 khi đổi từ khoá / phân loại
  useEffect(() => { setPage(1) }, [debouncedSearch, category])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const res = await productsService.getAll({
        search: debouncedSearch || undefined,
        category: category || undefined,
        sortBy: (sortBy as ProductSortField) || undefined,
        sortDir: sortBy ? sortDir : undefined,
        page,
        limit: LIMIT,
      })
      setProducts(res.data)
      setMeta(res.meta)
      setCategories((prev) => {
        const next = new Set(prev)
        res.data.forEach((p) => next.add(p.category))
        return Array.from(next).sort()
      })
    } catch {
      setLoadError(t.products.loadError)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, category, sortBy, sortDir, page, t.products.loadError])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Tự ẩn thông báo thành công sau 3s
  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  const openCreate = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (p: Product) => { setEditing(p); setFormOpen(true) }

  // Sort do server xử lý → cập nhật state + về trang 1
  const handleSortChange = (key: string | null, dir: SortDir) => {
    setSortBy(key)
    setSortDir(dir)
    setPage(1)
  }

  const handleSubmit = async (dto: CreateProductDto) => {
    if (editing) {
      await productsService.update(editing.id, dto)
      setNotice(t.products.updateSuccess)
    } else {
      await productsService.create(dto)
      setNotice(t.products.createSuccess)
    }
    setFormOpen(false)
    setEditing(null)
    await fetchProducts()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await productsService.remove(deleteTarget.id)
    setDeleteTarget(null)
    setNotice(t.products.deleteSuccess)
    // Nếu xoá phần tử cuối của trang > 1 thì lùi 1 trang
    if (products.length === 1 && page > 1) setPage((p) => p - 1)
    else await fetchProducts()
  }

  const totalPages = meta?.totalPages ?? 1

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: t.products.colName,
      accessor: (p) => p.name,
      sortable: true,
      searchable: true,
      render: (p) => <span className="font-semibold text-gray-900">{p.name}</span>,
    },
    {
      key: 'price',
      header: t.products.colPrice,
      accessor: (p) => p.price,
      sortable: true,
      align: 'right',
      render: (p) => priceFormatter.format(p.price),
    },
    {
      key: 'quantity',
      header: t.products.colQuantity,
      accessor: (p) => p.quantity,
      sortable: true,
      align: 'right',
    },
    {
      key: 'material',
      header: t.products.colMaterial,
      accessor: (p) => p.material,
      searchable: true,
      render: (p) => (p.material ? p.material : <span className="text-gray-400">—</span>),
    },
    {
      key: 'category',
      header: t.products.colCategory,
      accessor: (p) => p.category,
      sortable: true,
      searchable: true,
      render: (p) => <span className={styles.badge}>{p.category}</span>,
    },
    {
      key: 'actions',
      header: t.products.colActions,
      align: 'right',
      render: (p) => (
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => openEdit(p)} title={t.products.editTitle}>
            <PencilIcon size={16} />
          </button>
          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => setDeleteTarget(p)} title={t.products.deleteConfirm}>
            <TrashIcon size={16} />
          </button>
        </div>
      ),
    },
  ]

  const pagination = meta && meta.total > 0 && (
    <div className={styles.pagination}>
      <span className={styles.paginationInfo}>
        {t.products.total}: {meta.total}
      </span>
      <div className={styles.paginationControls}>
        <button
          className={styles.pageBtn}
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <ChevronLeftIcon size={16} /> {t.products.prev}
        </button>
        <span className={styles.pageLabel}>{t.products.page} {meta.page} / {totalPages}</span>
        <button
          className={styles.pageBtn}
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          {t.products.next} <ChevronRightIcon size={16} />
        </button>
      </div>
    </div>
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t.products.title}</h1>
          <p className={styles.pageSubtitle}>{t.products.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" onClick={() => setImportOpen(true)} className={styles.actionBtn}>
            <UploadIcon size={16} /> {t.products.importBtn}
          </Button>
          <Button onClick={openCreate} className={styles.actionBtn}>
            <PlusIcon size={16} /> {t.products.addBtn}
          </Button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.products.searchPlaceholder}
            startIcon={<SearchIcon size={16} />}
            className="bg-white shadow-sm"
          />
        </div>
        <div className={styles.filterBox}>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">{t.products.allCategories}</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
      </div>

      {notice && <Alert type="success" message={notice} />}
      {loadError && <Alert type="error" message={loadError} />}

      <Table
        columns={columns}
        data={products}
        rowKey={(p) => p.id}
        loading={loading}
        emptyText={t.products.empty}
        loadingText={t.products.loading}
        searchPlaceholder={t.products.filterPlaceholder}
        sortKey={sortBy}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        footer={pagination}
      />

      <ProductFormModal
        open={formOpen}
        product={editing}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onUploaded={fetchProducts}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={t.products.deleteTitle}
        description={t.products.deleteDesc}
        confirmLabel={t.products.deleteConfirm}
        cancelLabel={t.products.deleteCancel}
        variant="danger"
        icon={<TrashIcon />}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
