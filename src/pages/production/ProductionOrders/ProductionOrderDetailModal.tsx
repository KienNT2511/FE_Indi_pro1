import { useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import Button from '../../../components/ui/Button/Button'
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog'
import { CloseIcon, FactoryIcon, BanIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { ProductionOrderDetailModalProps } from './type'
import type { ProductionOrderStatus } from '../../../services/production/productionOrders.types'

const STATUS_CLASS: Record<ProductionOrderStatus, string> = {
  planned: 'badgeGray',
  in_progress: 'badgeBlue',
  completed: 'badgeGreen',
  cancelled: 'badgeRed',
}

export default function ProductionOrderDetailModal({ open, order, costing, onClose, onReport, onCancelOrder }: ProductionOrderDetailModalProps) {
  const { t, lang } = useLanguage()
  const o = t.production.orders
  const [confirmCancel, setConfirmCancel] = useState(false)

  const fmt = useMemo(() => new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])
  const fmtDate = useMemo(() => new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  if (!open || !order) return null

  const active = order.status !== 'cancelled'
  const canReport = active && order.status !== 'completed'
  const pct = order.plannedQty > 0 ? Math.min(100, Math.round((order.producedQty / order.plannedQty) * 100)) : 0

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
            <div className={styles.detailItem}><span className={styles.detailLabel}>{o.fProduct}</span><span className={styles.detailValue}>{order.product?.name ?? '—'}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>{o.fWarehouse}</span><span className={styles.detailValue}>{order.warehouse?.name ?? '—'}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>{o.fBom}</span><span className={styles.detailValue}>{order.bom?.code ?? o.noBom}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>{o.colStatus}</span><span className={styles.detailValue}><span className={`${styles.badge} ${styles[STATUS_CLASS[order.status]]}`}>{o.status[order.status]}</span></span></div>
            {order.dueDate && (
              <div className={styles.detailItem}><span className={styles.detailLabel}>{o.fDueDate}</span><span className={styles.detailValue}>{fmtDate.format(new Date(order.dueDate))}</span></div>
            )}
          </div>

          {/* Tiến độ */}
          <div className={styles.field}>
            <div className="flex items-center justify-between text-sm">
              <span className={styles.label}>{o.progressLabel}</span>
              <span className="font-semibold text-gray-800">{order.producedQty} / {order.plannedQty} ({pct}%)</span>
            </div>
            <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${pct}%` }} /></div>
          </div>

          {/* Giá thành */}
          {costing && (
            <>
              <span className={styles.sectionTitle}>{o.detailCosting}</span>
              <div className={styles.detailItemsTable}>
                <div className={`${styles.detailItemRow} ${styles.detailItemHead}`}>
                  <span>{o.cMaterial}</span>
                  <span className={styles.right}>{o.cQtyPerUnit}</span>
                  <span className={styles.right}>{o.cUnitCost}</span>
                  <span className={styles.right}>{o.cLineCost}</span>
                </div>
                {costing.materials.map((m, i) => (
                  <div key={i} className={styles.detailItemRow}>
                    <span className="font-medium text-gray-800">{m.materialName}</span>
                    <span className={styles.right}>{m.qtyPerUnit}</span>
                    <span className={styles.right}>{fmt.format(m.unitCost)}</span>
                    <span className={styles.right}>{fmt.format(m.lineCost)}</span>
                  </div>
                ))}
              </div>
              <div className={styles.summaryBox}>
                <div className={styles.summaryRow}><span>{o.cPerUnitMaterial}</span><span>{fmt.format(costing.perUnitMaterialCost)}</span></div>
                <div className={styles.summaryRow}><span>{o.cLabor}</span><span>{fmt.format(costing.laborCost)}</span></div>
                <div className={styles.summaryRow}><span>{o.cOverhead}</span><span>{fmt.format(costing.overheadCost)}</span></div>
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}><span>{o.cUnitTotal}</span><span>{fmt.format(costing.unitCost)}</span></div>
                <div className={`${styles.summaryRow} ${styles.summaryRemaining}`}><span>{o.cTotalPlanned}</span><span>{fmt.format(costing.totalPlannedCost)}</span></div>
              </div>
            </>
          )}

          {/* Lịch sử báo cáo */}
          <span className={styles.sectionTitle}>{o.entriesTitle}</span>
          <div className={styles.detailItemsTable}>
            {order.entries.length === 0 ? (
              <div className={styles.payRow}><span className={styles.muted}>{o.noEntries}</span><span /><span /></div>
            ) : (
              order.entries.map((e) => (
                <div key={e.id} className={styles.payRow}>
                  <span className="text-gray-700">{fmtDate.format(new Date(e.entryDate))}</span>
                  <span className={`${styles.right}`}>{e.quantity}</span>
                  <span className={`${styles.right} text-gray-500`}>{fmt.format(e.materialCost)}</span>
                </div>
              ))
            )}
          </div>

          <div className={styles.modalActions}>
            {canReport && (
              <Button type="button" variant="outline" onClick={onReport} className="flex-1"><FactoryIcon size={16} /> {o.reportAction}</Button>
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
