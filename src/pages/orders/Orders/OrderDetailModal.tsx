import { useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import Button from '../../../components/ui/Button/Button'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon } from '../../../assets/icons'
import { ORDER_STATUSES } from '../../../services/orders/orders.types'
import styles from './style.module.css'
import type { OrderDetailModalProps } from './type'
import type { OrderStatus } from '../../../services/orders/orders.types'

export default function OrderDetailModal({ open, order, onClose, onChangeStatus }: OrderDetailModalProps) {
  const { t, lang } = useLanguage()
  const [statusLoading, setStatusLoading] = useState(false)
  const [error, setError] = useState('')

  const fmt = useMemo(() => new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])
  const dateFmt = useMemo(() => new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  if (!open || !order) return null

  const handleStatus = async (status: OrderStatus) => {
    if (status === order.status) return
    setError('')
    setStatusLoading(true)
    try {
      await onChangeStatus(status)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? t.orders.saveError))
    } finally {
      setStatusLoading(false)
    }
  }

  const isCancelled = order.status === 'cancelled'

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.modal} ${styles.modalWide}`}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{t.orders.viewTitle} · {order.code}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          {/* Thông tin chung */}
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>{t.orders.customerLabel}</span>
              <span className={styles.detailValue}>{order.customer?.name ?? '—'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>{t.orders.phoneLabel}</span>
              <span className={styles.detailValue}>{order.customer?.phone ?? '—'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>{t.orders.dateLabel}</span>
              <span className={styles.detailValue}>{dateFmt.format(new Date(order.orderDate))}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>{t.orders.paymentLabel}</span>
              <span className={styles.detailValue}>
                {t.orders.payMethod[order.paymentMethod]} · {t.orders.payStatus[order.paymentStatus]}
              </span>
            </div>
          </div>

          {/* Đổi trạng thái */}
          <div className={styles.statusBar}>
            <span className={styles.label}>{t.orders.changeStatusTitle}</span>
            <div className={styles.statusSelect}>
              <Select value={order.status} disabled={isCancelled || statusLoading} onChange={(e) => handleStatus(e.target.value as OrderStatus)}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{t.orders.status[s]}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Dòng sản phẩm */}
          <div className={styles.detailItemsTable}>
            <div className={`${styles.detailItemRow} ${styles.detailItemHead}`}>
              <span>{t.orders.colProduct}</span>
              <span className={styles.right}>{t.orders.colQty}</span>
              <span className={styles.right}>{t.orders.colUnitPrice}</span>
              <span className={styles.right}>{t.orders.colLineTotal}</span>
            </div>
            {order.items.map((it) => (
              <div key={it.id} className={styles.detailItemRow}>
                <span className="font-medium text-gray-800">{it.productName}</span>
                <span className={styles.right}>{it.quantity}</span>
                <span className={styles.right}>{fmt.format(it.unitPrice)}</span>
                <span className={styles.right}>{fmt.format(it.lineTotal)}</span>
              </div>
            ))}
          </div>

          {/* Tổng kết */}
          <div className={styles.summaryBox}>
            <div className={styles.summaryRow}><span>{t.orders.subtotal}</span><span>{fmt.format(order.subtotal)}</span></div>
            <div className={styles.summaryRow}><span>{t.orders.discount}</span><span>-{fmt.format(order.discount)}</span></div>
            <div className={styles.summaryRow}><span>{t.orders.taxAmount} ({order.taxRate}%)</span><span>{fmt.format(order.taxAmount)}</span></div>
            <div className={styles.summaryRow}><span>{t.orders.shippingFee}</span><span>{fmt.format(order.shippingFee)}</span></div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}><span>{t.orders.totalLabel}</span><span>{fmt.format(order.total)}</span></div>
            <div className={styles.summaryRow}><span>{t.orders.amountPaid}</span><span>{fmt.format(order.amountPaid)}</span></div>
            <div className={`${styles.summaryRow} ${styles.summaryRemaining}`}><span>{t.orders.remaining}</span><span>{fmt.format(order.total - order.amountPaid)}</span></div>
          </div>

          {order.note && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>{t.orders.noteLabel}</span>
              <span className={styles.detailValue}>{order.note}</span>
            </div>
          )}

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{t.orders.closeBtn}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
