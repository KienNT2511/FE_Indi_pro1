import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import Button from '../../../components/ui/Button/Button'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog'
import { CloseIcon, ReceiptIcon } from '../../../assets/icons'
import styles from './style.module.css'
import { QUOTATION_STATUSES, type QuotationStatus } from '../../../services/sales/quotations.types'
import type { QuotationDetailModalProps } from './type'

export default function QuotationDetailModal({ open, quotation, onClose, onChangeStatus, onConvert }: QuotationDetailModalProps) {
  const { t, lang } = useLanguage()
  const q = t.sales.quotations

  const [status, setStatus] = useState<QuotationStatus>('draft')
  const [confirmConvert, setConfirmConvert] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const fmt = useMemo(() => new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])
  const fmtDate = useMemo(() => new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  useEffect(() => {
    if (!open || !quotation) return
    setStatus(quotation.status)
    setError('')
  }, [open, quotation])

  if (!open || !quotation) return null

  const isConverted = quotation.status === 'converted'

  const runStatus = async () => {
    setError(''); setBusy(true)
    try { await onChangeStatus(status) } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? q.saveError)
    } finally { setBusy(false) }
  }

  const runConvert = async () => {
    setError(''); setBusy(true)
    try { await onConvert() } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? q.saveError)
    } finally { setBusy(false) }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.modal} ${styles.modalWide}`}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{q.viewTitle} · {quotation.code}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          <span className={styles.sectionTitle}>{q.detailInfo}</span>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}><span className={styles.detailLabel}>{q.fCustomer}</span><span className={styles.detailValue}>{quotation.customer?.name ?? '—'}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>{q.colDate}</span><span className={styles.detailValue}>{fmtDate.format(new Date(quotation.quoteDate))}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>{q.colStatus}</span><span className={styles.detailValue}>{q.status[quotation.status]}</span></div>
            {quotation.validUntil && (
              <div className={styles.detailItem}><span className={styles.detailLabel}>{q.fValidUntil}</span><span className={styles.detailValue}>{fmtDate.format(new Date(quotation.validUntil))}</span></div>
            )}
          </div>

          <span className={styles.sectionTitle}>{q.detailItems}</span>
          <div className={styles.detailItemsTable}>
            <div className={`${styles.detailItemRow} ${styles.detailItemHead}`}>
              <span>{q.iProduct}</span>
              <span className={styles.right}>{q.iQty}</span>
              <span className={styles.right}>{q.iUnitPrice}</span>
              <span className={styles.right}>{q.iLineTotal}</span>
            </div>
            {quotation.items.map((it) => (
              <div key={it.id} className={styles.detailItemRow}>
                <span className="font-medium text-gray-800">{it.productName}</span>
                <span className={styles.right}>{it.quantity}</span>
                <span className={styles.right}>{fmt.format(it.unitPrice)}</span>
                <span className={styles.right}>{fmt.format(it.lineTotal)}</span>
              </div>
            ))}
          </div>

          <div className={styles.summaryBox}>
            <div className={styles.summaryRow}><span>{q.subtotal}</span><span>{fmt.format(quotation.subtotal)}</span></div>
            <div className={styles.summaryRow}><span>{q.taxAmount}</span><span>{fmt.format(quotation.taxAmount)}</span></div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}><span>{q.totalLabel}</span><span>{fmt.format(quotation.total)}</span></div>
          </div>

          {!isConverted && (
            <>
              <span className={styles.sectionTitle}>{q.changeStatus}</span>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <Select value={status} onChange={(e) => setStatus(e.target.value as QuotationStatus)}>
                    {QUOTATION_STATUSES.filter((st) => st !== 'converted').map((st) => (<option key={st} value={st}>{q.status[st]}</option>))}
                  </Select>
                </div>
                <Button type="button" variant="outline" onClick={runStatus} loading={busy} className="w-auto px-4">{t.sales.common.save}</Button>
                <Button type="button" onClick={() => setConfirmConvert(true)} loading={busy} className="w-auto px-4"><ReceiptIcon size={16} /> {q.convertAction}</Button>
              </div>
            </>
          )}

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{q.closeBtn}</Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmConvert}
        title={q.convertTitle}
        description={q.convertDesc}
        confirmLabel={q.convertConfirm}
        cancelLabel={q.cancelBtn}
        icon={<ReceiptIcon />}
        onConfirm={async () => { setConfirmConvert(false); await runConvert() }}
        onCancel={() => setConfirmConvert(false)}
      />
    </div>
  )
}
