import { useEffect, useState, type FormEvent } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { productsService } from '../../../services/products/products.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { BatchFormModalProps } from './type'
import type { Product } from '../../../services/products/products.types'

export default function BatchFormModal({ open, batch, onClose, onSubmit }: BatchFormModalProps) {
  const { t } = useLanguage()
  const b = t.inventory.batches
  const isEdit = batch !== null

  const [products, setProducts] = useState<Product[]>([])
  const [code, setCode] = useState('')
  const [productId, setProductId] = useState('')
  const [manufactureDate, setManufactureDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setCode(batch?.code ?? '')
    setProductId(batch?.productId ?? '')
    setManufactureDate(batch?.manufactureDate ?? '')
    setExpiryDate(batch?.expiryDate ?? '')
    setNote(batch?.note ?? '')
    setError('')
    productsService.getAll({ limit: 1000 }).then((r) => setProducts(r.data)).catch(() => {})
  }, [open, batch])

  if (!open) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim()) { setError(b.codeRequired); return }
    if (!productId) { setError(b.productRequired); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit({
        code: code.trim(),
        productId,
        manufactureDate: manufactureDate || undefined,
        expiryDate: expiryDate || undefined,
        note: note.trim() || undefined,
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
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{isEdit ? b.editTitle : b.createTitle}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{b.fCode}</label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder={b.codePlaceholder} autoFocus />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{b.fProduct}</label>
              <Select value={productId} onChange={(e) => setProductId(e.target.value)} disabled={isEdit}>
                <option value="">{t.inventory.common.selectProduct}</option>
                {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </Select>
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{b.fMfg} <span className={styles.optional}>{t.inventory.common.optional}</span></label>
              <Input type="date" value={manufactureDate} onChange={(e) => setManufactureDate(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{b.fExpiry} <span className={styles.optional}>{t.inventory.common.optional}</span></label>
              <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{b.fNote} <span className={styles.optional}>{t.inventory.common.optional}</span></label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={b.notePlaceholder} />
          </div>

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{t.inventory.common.cancel}</Button>
            <Button type="submit" loading={loading} className="flex-1">{isEdit ? t.inventory.common.save : t.inventory.common.create}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
