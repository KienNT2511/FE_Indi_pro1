import { useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import Button from '../../../components/ui/Button/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog'
import { CloseIcon, ArrowDownIcon, WalletIcon, BanIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { PoDetailModalProps } from './type'
import type { PurchaseOrderStatus } from '../../../services/purchasing/purchaseOrders.types'

const STATUS_CLASS: Record<PurchaseOrderStatus, string> = {
  pending: 'badgeYellow',
  confirmed: 'badgeBlue',
  partially_received: 'badgeIndigo',
  received: 'badgeGreen',
  cancelled: 'badgeGray',
}

export default function PurchaseOrderDetailModal({ open, order, payments, onClose, onReceive, onPay, onCancelOrder }: PoDetailModalProps) {
  const { t, lang } = useLanguage()
  const o = t.purchasing.orders
  const [confirmCancel, setConfirmCancel] = useState(false)

  const fmt = useMemo(() => new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])
  const fmtDate = useMemo(() => new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  if (!open || !order) return null

  const outstanding = Math.max(0, order.total - order.amountPaid)
  const fullyReceived = order.items.every((i) => i.receivedQty >= i.quantity)
  const active = order.status !== 'cancelled'

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.modal} ${styles.modalWide}`}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{o.viewTitle} · {order.code}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          <span className={styles.sectionTitle}>{o.detailInfo}</span>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}><span className={styles.detailLabel}>{o.fSupplier}</span><span className={styles.detailValue}>{order.supplier?.name ?? '—'}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>{o.colDate}</span><span className={styles.detailValue}>{fmtDate.format(new Date(order.orderDate))}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>{o.statusLabel}</span><span className={styles.detailValue}><span className={`${styles.badge} ${styles[STATUS_CLASS[order.status]]}`}>{o.status[order.status]}</span></span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>{o.colPayment}</span><span className={styles.detailValue}>{t.orders.payStatus[order.paymentStatus]}</span></div>
            {order.expectedDate && (
              <div className={styles.detailItem}><span className={styles.detailLabel}>{o.fExpectedDate}</span><span className={styles.detailValue}>{fmtDate.format(new Date(order.expectedDate))}</span></div>
            )}
            {order.note && (
              <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}><span className={styles.detailLabel}>{o.fNote}</span><span className={styles.detailValue}>{order.note}</span></div>
            )}
          </div>

          <span className={styles.sectionTitle}>{o.detailItems}</span>
          <div className={styles.detailItemsTable}>
            <div className={`${styles.detailItemRow} ${styles.detailItemHead}`}>
              <span>{o.iProduct}</span>
              <span className={styles.right}>{o.iQty}/{o.iReceived}</span>
              <span className={styles.right}>{o.iUnitCost}</span>
              <span className={styles.right}>{o.iLineTotal}</span>
            </div>
            {order.items.map((it) => (
              <div key={it.id} className={styles.detailItemRow}>
                <span className="font-medium text-gray-800">{it.productName}</span>
                <span className={styles.right}>{it.quantity} / <span className={it.receivedQty >= it.quantity ? 'text-green-600' : 'text-amber-600'}>{it.receivedQty}</span></span>
                <span className={styles.right}>{fmt.format(it.unitCost)}</span>
                <span className={styles.right}>{fmt.format(it.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div className={styles.summaryBox}>
            <div className={styles.summaryRow}><span>{o.subtotal}</span><span>{fmt.format(order.subtotal)}</span></div>
            <div className={styles.summaryRow}><span>{o.taxAmount}</span><span>{fmt.format(order.taxAmount)}</span></div>
            <div className={styles.summaryRow}><span>{o.shippingFee}</span><span>{fmt.format(order.shippingFee)}</span></div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}><span>{o.totalLabel}</span><span>{fmt.format(order.total)}</span></div>
            <div className={styles.summaryRow}><span>{o.amountPaid}</span><span>{fmt.format(order.amountPaid)}</span></div>
            <div className={`${styles.summaryRow} ${styles.summaryRemaining}`}><span>{o.remaining}</span><span>{fmt.format(outstanding)}</span></div>
          </div>

          <span className={styles.sectionTitle}>{o.payHistory}</span>
          <div className={styles.detailItemsTable}>
            {payments.length === 0 ? (
              <div className={styles.payRow}><span className={styles.muted}>{o.noPayments}</span><span /><span /></div>
            ) : (
              payments.map((p) => (
                <div key={p.id} className={styles.payRow}>
                  <span className="text-gray-700">{t.orders.payMethod[p.method]}</span>
                  <span className={styles.muted}>{fmtDate.format(new Date(p.paymentDate))}</span>
                  <span className={`${styles.right} font-medium text-gray-800`}>{fmt.format(p.amount)}</span>
                </div>
              ))
            )}
          </div>

          <div className={styles.modalActions}>
            {active && !fullyReceived && (
              <Button type="button" variant="outline" onClick={onReceive} className="flex-1"><ArrowDownIcon size={16} /> {o.receiveAction}</Button>
            )}
            {active && outstanding > 0 && (
              <Button type="button" variant="outline" onClick={onPay} className="flex-1"><WalletIcon size={16} /> {o.payAction}</Button>
            )}
            {active && (
              <Button type="button" variant="danger" onClick={() => setConfirmCancel(true)} className="flex-1"><BanIcon size={16} /> {o.cancelAction}</Button>
            )}
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{o.closeBtn}</Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title={o.cancelTitle}
        description={o.cancelDesc}
        confirmLabel={o.cancelConfirm}
        cancelLabel={o.closeBtn}
        variant="danger"
        icon={<BanIcon />}
        onConfirm={async () => { setConfirmCancel(false); await onCancelOrder() }}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  )
}
