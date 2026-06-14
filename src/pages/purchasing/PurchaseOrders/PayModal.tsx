import { useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon } from '../../../assets/icons'
import { PAYMENT_METHODS, type PaymentMethod } from '../../../services/orders/orders.types'
import styles from './style.module.css'
import type { PayModalProps } from './type'

const num = (s: string) => Number(s) || 0

export default function PayModal({ open, order, onClose, onSubmit }: PayModalProps) {
  const { t } = useLanguage()
  const o = t.purchasing.orders

  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer')
  const [paymentDate, setPaymentDate] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !order) return
    const remaining = Math.max(0, order.total - order.amountPaid)
    setAmount(String(remaining))
    setMethod(order.paymentMethod)
    setPaymentDate(new Date().toISOString().slice(0, 10))
    setNote('')
    setError('')
  }, [open, order])

  if (!open || !order) return null

  const handleSubmit = async () => {
    if (num(amount) <= 0) { setError(o.payAmount); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit({
        amount: num(amount),
        method,
        paymentDate: paymentDate || undefined,
        note: note.trim() || undefined,
      })
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
          <h3 className={styles.modalTitle}>{o.payTitle} · {order.code}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{o.payAmount}</label>
              <Input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="text-right" autoFocus />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{o.payMethodLabel}</label>
              <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                {PAYMENT_METHODS.map((m) => (<option key={m} value={m}>{t.orders.payMethod[m]}</option>))}
              </Select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{o.payDate}</label>
            <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{o.payNote} <span className={styles.optional}>{t.purchasing.common.optional}</span></label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{o.cancelBtn}</Button>
            <Button type="button" loading={loading} onClick={handleSubmit} className="flex-1">{o.payConfirm}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
