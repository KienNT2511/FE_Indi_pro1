import { useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { ReportModalProps } from './type'

const num = (s: string) => Number(s) || 0

export default function ReportModal({ open, order, onClose, onSubmit }: ReportModalProps) {
  const { t } = useLanguage()
  const o = t.production.orders

  const [quantity, setQuantity] = useState('')
  const [entryDate, setEntryDate] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const remaining = order ? order.plannedQty - order.producedQty : 0

  useEffect(() => {
    if (!open || !order) return
    setQuantity(String(Math.max(0, order.plannedQty - order.producedQty)))
    setEntryDate(new Date().toISOString().slice(0, 10))
    setNote('')
    setError('')
  }, [open, order])

  if (!open || !order) return null

  const handleSubmit = async () => {
    if (num(quantity) < 1) { setError(o.qtyRequired); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit({ quantity: Math.round(num(quantity)), entryDate: entryDate || undefined, note: note.trim() || undefined })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? o.saveError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{o.reportTitle} · {order.code}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          {remaining <= 0 ? (
            <Alert type="info" message={o.reportNothing} />
          ) : (
            <>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>{o.reportQty}</label>
                  <Input type="number" min={1} max={remaining} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="text-right" autoFocus />
                  <span className={`${styles.muted} text-sm`}>{o.reportRemaining}: {remaining}</span>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{o.reportDate}</label>
                  <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{o.reportNote} <span className={styles.optional}>{t.production.common.optional}</span></label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </>
          )}

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{o.cancelBtn}</Button>
            <Button type="button" loading={loading} onClick={handleSubmit} disabled={remaining <= 0} className="flex-1">{o.reportConfirm}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
