import { useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import Button from '../../../components/ui/Button/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog'
import { CloseIcon, BanIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { StockDocDetailModalProps } from './type'

export default function StockDocDetailModal({ open, doc, onClose, onCancelDoc }: StockDocDetailModalProps) {
  const { t, lang } = useLanguage()
  const d = t.inventory.docs
  const [confirmCancel, setConfirmCancel] = useState(false)

  const fmtDate = useMemo(() => new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  if (!open || !doc) return null

  const isCount = doc.type === 'count'
  const isTransfer = doc.type === 'transfer'
  const canCancel = doc.status === 'posted'

  const statusBadge = (
    <span className={`${styles.badge} ${doc.status === 'posted' ? styles.badgeGreen : styles.badgeGray}`}>
      {d.status[doc.status]}
    </span>
  )

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.modal} ${styles.modalWide}`}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{d.viewTitle} · {doc.code}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          <span className={styles.sectionTitle}>{d.detailInfo}</span>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>{d.colStatus}</span>
              <span className={styles.detailValue}>{statusBadge}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>{d.colDate}</span>
              <span className={styles.detailValue}>{fmtDate.format(new Date(doc.date))}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>{d.colWarehouse}</span>
              <span className={styles.detailValue}>{doc.warehouse?.name ?? '—'}</span>
            </div>
            {isTransfer && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>{d.colCounter}</span>
                <span className={styles.detailValue}>{doc.counterWarehouse?.name ?? '—'}</span>
              </div>
            )}
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>{d[doc.type].partnerLabel}</span>
              <span className={styles.detailValue}>{doc.partnerName || '—'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>{d.fReason}</span>
              <span className={styles.detailValue}>{doc.reason || '—'}</span>
            </div>
            {doc.note && (
              <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                <span className={styles.detailLabel}>{d.fNote}</span>
                <span className={styles.detailValue}>{doc.note}</span>
              </div>
            )}
          </div>

          <span className={styles.sectionTitle}>{d.detailItems}</span>
          <div className={styles.detailItemsTable}>
            <div className={`${styles.detailItemRow} ${styles.detailItemHead}`}>
              <span>{d.iProduct}</span>
              <span>{d.iBatch}</span>
              <span className={styles.right}>{isCount ? d.iCountedQty : d.iQty}</span>
              <span className={styles.right}>{isCount ? d.iDiff : d.iSystemQty}</span>
            </div>
            {doc.items.map((it) => {
              const diff = it.systemQty !== null ? it.quantity - it.systemQty : null
              return (
                <div key={it.id} className={styles.detailItemRow}>
                  <span className="font-medium text-gray-800">{it.productName}</span>
                  <span>{it.batchCode || <span className={styles.muted}>—</span>}</span>
                  <span className={styles.right}>{it.quantity}</span>
                  <span className={styles.right}>
                    {isCount && diff !== null
                      ? <span className={diff === 0 ? styles.muted : diff > 0 ? styles.posNum : styles.negNum}>{diff > 0 ? `+${diff}` : diff}</span>
                      : <span className={styles.muted}>—</span>}
                  </span>
                </div>
              )
            })}
          </div>

          <div className={styles.modalActions}>
            {canCancel && (
              <Button type="button" variant="danger" onClick={() => setConfirmCancel(true)} className="flex-1">
                <BanIcon size={16} /> {d.cancelAction}
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{d.closeBtn}</Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title={d.cancelTitle}
        description={d.cancelDesc}
        confirmLabel={d.cancelConfirm}
        cancelLabel={t.inventory.common.close}
        variant="danger"
        icon={<BanIcon />}
        onConfirm={async () => { setConfirmCancel(false); await onCancelDoc() }}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  )
}
