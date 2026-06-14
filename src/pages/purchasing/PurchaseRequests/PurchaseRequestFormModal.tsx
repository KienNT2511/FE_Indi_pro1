import { useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { productsService } from '../../../services/products/products.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon, PlusIcon, TrashIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { PrFormModalProps, PrItemRow } from './type'
import type { Product } from '../../../services/products/products.types'

const num = (s: string) => Number(s) || 0
const newRow = (): PrItemRow => ({ key: crypto.randomUUID(), productId: '', quantity: '1' })

export default function PurchaseRequestFormModal({ open, onClose, onSubmit }: PrFormModalProps) {
  const { t } = useLanguage()
  const r = t.purchasing.requests

  const [products, setProducts] = useState<Product[]>([])
  const [requestedBy, setRequestedBy] = useState('')
  const [requestDate, setRequestDate] = useState('')
  const [note, setNote] = useState('')
  const [items, setItems] = useState<PrItemRow[]>([newRow()])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setRequestedBy(''); setRequestDate(new Date().toISOString().slice(0, 10)); setNote('')
    setItems([newRow()]); setError('')
    productsService.getAll({ limit: 1000 }).then((res) => setProducts(res.data)).catch(() => {})
  }, [open])

  if (!open) return null

  const updateRow = (key: string, patch: Partial<PrItemRow>) =>
    setItems((rows) => rows.map((x) => (x.key === key ? { ...x, ...patch } : x)))
  const addRow = () => setItems((rows) => [...rows, newRow()])
  const removeRow = (key: string) => setItems((rows) => (rows.length > 1 ? rows.filter((x) => x.key !== key) : rows))

  const handleSubmit = async () => {
    const validItems = items.filter((x) => x.productId && num(x.quantity) >= 1)
    if (validItems.length === 0) { setError(r.itemsRequired); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit({
        requestedBy: requestedBy.trim() || undefined,
        requestDate: requestDate || undefined,
        note: note.trim() || undefined,
        items: validItems.map((x) => ({ productId: x.productId, quantity: Math.round(num(x.quantity)) })),
      })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? r.saveError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.modal} ${styles.modalWide}`}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{r.createTitle}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{r.fRequestedBy} <span className={styles.optional}>{t.purchasing.common.optional}</span></label>
              <Input value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} placeholder={r.requestedByPlaceholder} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{r.fRequestDate}</label>
              <Input type="date" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} />
            </div>
          </div>

          <div className={styles.itemsSection}>
            <div className={styles.itemsHeader}>
              <span className={styles.label}>{r.itemsTitle}</span>
              <Button type="button" variant="outline" onClick={addRow} className="w-auto px-3 py-1.5 gap-1.5 min-h-0">
                <PlusIcon size={14} /> {r.addItem}
              </Button>
            </div>
            <div className={styles.itemsTable}>
              <div className={`${styles.prItemRow} ${styles.itemHead}`}>
                <span>{r.iProduct}</span>
                <span className={styles.right}>{r.iQty}</span>
                <span />
              </div>
              {items.map((row) => (
                <div key={row.key} className={styles.prItemRow}>
                  <Select value={row.productId} onChange={(e) => updateRow(row.key, { productId: e.target.value })}>
                    <option value="">{t.purchasing.common.selectProduct}</option>
                    {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </Select>
                  <Input type="number" min={1} value={row.quantity} onChange={(e) => updateRow(row.key, { quantity: e.target.value })} className="text-right" />
                  <button type="button" className={styles.rowRemove} onClick={() => removeRow(row.key)} title={r.deleteAction}><TrashIcon size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{r.fNote} <span className={styles.optional}>{t.purchasing.common.optional}</span></label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={r.notePlaceholder} />
          </div>

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{r.cancelBtn}</Button>
            <Button type="button" loading={loading} onClick={handleSubmit} className="flex-1">{r.createBtn}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
