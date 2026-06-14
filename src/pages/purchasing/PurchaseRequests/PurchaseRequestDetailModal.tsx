import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { suppliersService } from '../../../services/purchasing/suppliers.service'
import Button from '../../../components/ui/Button/Button'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon } from '../../../assets/icons'
import styles from './style.module.css'
import { PR_STATUSES, type PurchaseRequestStatus } from '../../../services/purchasing/purchaseRequests.types'
import type { PrDetailModalProps } from './type'
import type { Supplier } from '../../../services/purchasing/suppliers.types'

export default function PurchaseRequestDetailModal({ open, request, onClose, onChangeStatus, onConvert }: PrDetailModalProps) {
  const { t, lang } = useLanguage()
  const r = t.purchasing.requests

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [status, setStatus] = useState<PurchaseRequestStatus>('draft')
  const [supplierId, setSupplierId] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const fmtDate = useMemo(() => new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  useEffect(() => {
    if (!open || !request) return
    setStatus(request.status)
    setSupplierId('')
    setError('')
    suppliersService.getAll({ limit: 1000, sortBy: 'name', sortDir: 'asc' }).then((res) => setSuppliers(res.data)).catch(() => {})
  }, [open, request])

  if (!open || !request) return null

  const isConverted = request.status === 'converted'

  const runStatus = async () => {
    setError(''); setBusy(true)
    try { await onChangeStatus(status) } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? r.saveError)
    } finally { setBusy(false) }
  }

  const runConvert = async () => {
    if (!supplierId) { setError(r.supplierRequired); return }
    setError(''); setBusy(true)
    try { await onConvert(supplierId) } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? r.saveError)
    } finally { setBusy(false) }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.modal} ${styles.modalWide}`}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{r.viewTitle} · {request.code}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          <span className={styles.sectionTitle}>{r.detailInfo}</span>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}><span className={styles.detailLabel}>{r.colStatus}</span><span className={styles.detailValue}>{r.status[request.status]}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>{r.colDate}</span><span className={styles.detailValue}>{fmtDate.format(new Date(request.requestDate))}</span></div>
            <div className={styles.detailItem}><span className={styles.detailLabel}>{r.colRequestedBy}</span><span className={styles.detailValue}>{request.requestedBy || '—'}</span></div>
            {request.note && (
              <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}><span className={styles.detailLabel}>{r.fNote}</span><span className={styles.detailValue}>{request.note}</span></div>
            )}
          </div>

          <span className={styles.sectionTitle}>{r.detailItems}</span>
          <div className={styles.detailItemsTable}>
            {request.items.map((it) => (
              <div key={it.id} className={styles.payRow}>
                <span className="font-medium text-gray-800">{it.productName}</span>
                <span className={styles.right}>{it.quantity}</span>
                <span className={styles.muted}>{it.note || ''}</span>
              </div>
            ))}
          </div>

          {!isConverted && (
            <>
              <span className={styles.sectionTitle}>{r.changeStatus}</span>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <Select value={status} onChange={(e) => setStatus(e.target.value as PurchaseRequestStatus)}>
                    {PR_STATUSES.filter((st) => st !== 'converted').map((st) => (<option key={st} value={st}>{r.status[st]}</option>))}
                  </Select>
                </div>
                <Button type="button" variant="outline" onClick={runStatus} loading={busy} className="w-auto px-4">{t.purchasing.common.save}</Button>
              </div>

              <span className={styles.sectionTitle}>{r.convertTitle}</span>
              <p className={styles.detailLabel}>{r.convertDesc}</p>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                    <option value="">{t.purchasing.common.selectSupplier}</option>
                    {suppliers.map((sp) => (<option key={sp.id} value={sp.id}>{sp.name}</option>))}
                  </Select>
                </div>
                <Button type="button" onClick={runConvert} loading={busy} className="w-auto px-4">{r.convertConfirm}</Button>
              </div>
            </>
          )}

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{r.closeBtn}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
