import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { ordersService } from '../../../services/orders/orders.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon } from '../../../assets/icons'
import { PAYMENT_METHODS, type PaymentMethod, type Order } from '../../../services/orders/orders.types'
import styles from './style.module.css'
import type { CollectModalProps } from './type'

const num = (s: string) => Number(s) || 0

export default function CollectModal({ open, customer, onClose, onSubmit }: CollectModalProps) {
  const { t, lang } = useLanguage()
  const r = t.sales.receivables

  const [orders, setOrders] = useState<Order[]>([])
  const [orderId, setOrderId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [paymentDate, setPaymentDate] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fmt = useMemo(() => new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  useEffect(() => {
    if (!open || !customer) return
    setOrderId(''); setAmount(''); setMethod('cash'); setPaymentDate(new Date().toISOString().slice(0, 10)); setNote(''); setError('')
    ordersService
      .getAll({ customerId: customer.customerId, limit: 200, sortBy: 'createdAt', sortDir: 'desc' })
      .then((res) => setOrders(res.data.filter((o) => o.status !== 'cancelled' && o.total - o.amountPaid > 0)))
      .catch(() => {})
  }, [open, customer])

  const selectedOrder = orders.find((o) => o.id === orderId)
  const remaining = selectedOrder ? selectedOrder.total - selectedOrder.amountPaid : 0

  const onPickOrder = (id: string) => {
    setOrderId(id)
    const o = orders.find((x) => x.id === id)
    setAmount(o ? String(o.total - o.amountPaid) : '')
  }

  if (!open || !customer) return null

  const handleSubmit = async () => {
    if (!orderId) { setError(r.orderRequired); return }
    if (num(amount) <= 0) { setError(r.amountRequired); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit(orderId, { amount: num(amount), method, paymentDate: paymentDate || undefined, note: note.trim() || undefined })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? r.loadError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{r.collectTitle} · {customer.customerName}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.field}>
            <label className={styles.label}>{r.collectSelectOrder}</label>
            <Select value={orderId} onChange={(e) => onPickOrder(e.target.value)}>
              <option value="">{r.collectSelectOrder}</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>{o.code} · {fmt.format(o.total - o.amountPaid)}</option>
              ))}
            </Select>
            {orders.length === 0 && <span className={`${styles.muted} text-sm`}>{r.collectNoOrders}</span>}
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{r.collectAmount}</label>
              <Input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="text-right" />
              {selectedOrder && <span className={`${styles.muted} text-sm`}>{r.colOutstanding}: {fmt.format(remaining)}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{r.collectMethod}</label>
              <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                {PAYMENT_METHODS.map((m) => (<option key={m} value={m}>{t.orders.payMethod[m]}</option>))}
              </Select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{r.collectDate}</label>
            <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{r.collectNote} <span className={styles.optional}>{t.sales.common.optional}</span></label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{t.sales.common.cancel}</Button>
            <Button type="button" loading={loading} onClick={handleSubmit} className="flex-1">{r.collectConfirm}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
