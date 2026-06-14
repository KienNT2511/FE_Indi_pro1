import { useMemo } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import Button from '../../../components/ui/Button/Button'
import { CloseIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { DeliveryDetailModalProps } from './type'

export default function DeliveryDetailModal({ open, delivery, onClose }: DeliveryDetailModalProps) {
  const { t, lang } = useLanguage()
  const d = t.sales.deliveries

  const fmtDate = useMemo(() => new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  if (!open || !delivery) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{d.viewTitle} · {delivery.code}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          <span className={styles.sectionTitle}>{d.detailInfo}</span>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}><span className={styles.detailLabel}>{d.colOrder}</span><span className={styles.detailValue}>{delivery.order?.code ?? '—'}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>{d.colWarehouse}</span><span className={styles.detailValue}>{delivery.warehouse?.name ?? '—'}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>{d.colDate}</span><span className={styles.detailValue}>{fmtDate.format(new Date(delivery.deliveryDate))}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>{d.colCode}</span><span className={styles.detailValue}>{delivery.stockDocCode ?? '—'}</span></div>
            {delivery.note && (
              <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}><span className={styles.detailLabel}>{d.fNote}</span><span className={styles.detailValue}>{delivery.note}</span></div>
            )}
          </div>

          <span className={styles.sectionTitle}>{d.detailItems}</span>
          <div className={styles.detailItemsTable}>
            {delivery.items.map((it) => (
              <div key={it.id} className={styles.payRow}>
                <span className="font-medium text-gray-800">{it.productName}</span>
                <span /><span className={`${styles.right} font-medium`}>{it.quantity}</span>
              </div>
            ))}
          </div>

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{d.closeBtn}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
