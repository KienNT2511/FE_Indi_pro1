import { useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { productsService } from '../../../services/products/products.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon, PlusIcon, TrashIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { BomFormModalProps, BomItemRow } from './type'
import type { Product } from '../../../services/products/products.types'

const num = (s: string) => Number(s) || 0
const newRow = (): BomItemRow => ({ key: crypto.randomUUID(), materialProductId: '', quantity: '1' })

export default function BomFormModal({ open, bom, onClose, onSubmit }: BomFormModalProps) {
  const { t } = useLanguage()
  const b = t.production.boms
  const isEdit = bom !== null

  const [products, setProducts] = useState<Product[]>([])
  const [name, setName] = useState('')
  const [productId, setProductId] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [note, setNote] = useState('')
  const [items, setItems] = useState<BomItemRow[]>([newRow()])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(bom?.name ?? '')
    setProductId(bom?.productId ?? '')
    setIsActive(bom?.isActive ?? true)
    setNote(bom?.note ?? '')
    setItems(
      bom && bom.items.length > 0
        ? bom.items.map((it) => ({ key: crypto.randomUUID(), materialProductId: it.materialProductId, quantity: String(it.quantity) }))
        : [newRow()],
    )
    setError('')
    productsService.getAll({ limit: 1000 }).then((r) => setProducts(r.data)).catch(() => {})
  }, [open, bom])

  if (!open) return null

  const updateRow = (key: string, patch: Partial<BomItemRow>) =>
    setItems((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  const addRow = () => setItems((rows) => [...rows, newRow()])
  const removeRow = (key: string) => setItems((rows) => (rows.length > 1 ? rows.filter((r) => r.key !== key) : rows))

  const handleSubmit = async () => {
    if (!name.trim()) { setError(b.nameRequired); return }
    if (!productId) { setError(b.productRequired); return }
    const validItems = items.filter((r) => r.materialProductId && num(r.quantity) > 0)
    if (validItems.length === 0) { setError(b.itemsRequired); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        productId,
        isActive,
        note: note.trim() || undefined,
        items: validItems.map((r) => ({ materialProductId: r.materialProductId, quantity: num(r.quantity) })),
      })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? b.saveError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.modal} ${styles.modalWide}`}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{isEdit ? b.editTitle : b.createTitle}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{b.fName}</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={b.namePlaceholder} autoFocus />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{b.fProduct}</label>
              <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">{t.production.common.selectProduct}</option>
                {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </Select>
            </div>
          </div>

          <div className={styles.itemsSection}>
            <div className={styles.itemsHeader}>
              <span className={styles.label}>{b.itemsTitle}</span>
              <Button type="button" variant="outline" onClick={addRow} className="w-auto px-3 py-1.5 gap-1.5 min-h-0">
                <PlusIcon size={14} /> {b.addItem}
              </Button>
            </div>
            <div className={styles.itemsTable}>
              <div className={`${styles.prItemRow} ${styles.itemHead}`}>
                <span>{b.iMaterial}</span>
                <span className={styles.right}>{b.iQty}</span>
                <span />
              </div>
              {items.map((row) => (
                <div key={row.key} className={styles.prItemRow}>
                  <Select value={row.materialProductId} onChange={(e) => updateRow(row.key, { materialProductId: e.target.value })}>
                    <option value="">{t.production.common.selectProduct}</option>
                    {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </Select>
                  <Input type="number" min={0} step="0.0001" value={row.quantity} onChange={(e) => updateRow(row.key, { quantity: e.target.value })} className="text-right" />
                  <button type="button" className={styles.rowRemove} onClick={() => removeRow(row.key)} title={b.deleteConfirm}><TrashIcon size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{b.fNote} <span className={styles.optional}>{t.production.common.optional}</span></label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={b.notePlaceholder} />
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span className={styles.label}>{b.fActive}</span>
          </label>

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{b.cancelBtn}</Button>
            <Button type="button" loading={loading} onClick={handleSubmit} className="flex-1">{isEdit ? t.production.common.save : b.createBtn}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
