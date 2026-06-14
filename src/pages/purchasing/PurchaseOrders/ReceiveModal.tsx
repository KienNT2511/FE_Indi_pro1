import { useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { warehousesService } from '../../../services/inventory/warehouses.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { ReceiveModalProps, ReceiveRow } from './type'
import type { Warehouse } from '../../../services/inventory/warehouses.types'

const num = (s: string) => Number(s) || 0

export default function ReceiveModal({ open, order, onClose, onSubmit }: ReceiveModalProps) {
  const { t } = useLanguage()
  const o = t.purchasing.orders

  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [warehouseId, setWarehouseId] = useState('')
  const [rows, setRows] = useState<ReceiveRow[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !order) return
    setWarehouseId('')
    setError('')
    setRows(
      order.items
        .map((it) => ({
          itemId: it.id,
          productName: it.productName,
          remaining: it.quantity - it.receivedQty,
          quantity: String(Math.max(0, it.quantity - it.receivedQty)),
          batchCode: '',
        }))
        .filter((r) => r.remaining > 0),
    )
    warehousesService.getAll({ limit: 1000, sortBy: 'name', sortDir: 'asc' }).then((res) => setWarehouses(res.data)).catch(() => {})
  }, [open, order])

  if (!open || !order) return null

  const updateRow = (itemId: string, patch: Partial<ReceiveRow>) =>
    setRows((rs) => rs.map((r) => (r.itemId === itemId ? { ...r, ...patch } : r)))

  const handleSubmit = async () => {
    if (!warehouseId) { setError(o.receiveSelectWarehouse); return }
    const items = rows
      .filter((r) => num(r.quantity) > 0)
      .map((r) => ({ itemId: r.itemId, quantity: Math.round(num(r.quantity)), batchCode: r.batchCode.trim() || undefined }))
    if (items.length === 0) { setError(o.itemsRequired); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit({ warehouseId, items })
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
      <div className={`${styles.modal} ${styles.modalWide}`}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{o.receiveTitle} · {order.code}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.field}>
            <label className={styles.label}>{o.receiveWarehouse}</label>
            <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
              <option value="">{o.receiveSelectWarehouse}</option>
              {warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
            </Select>
          </div>

          {rows.length === 0 ? (
            <Alert type="info" message={o.receiveNothing} />
          ) : (
            <div className={styles.itemsSection}>
              <div className={`${styles.recvItemRow} ${styles.itemHead}`}>
                <span>{o.iProduct}</span>
                <span className={styles.right}>{o.receiveRemaining}</span>
                <span className={styles.right}>{o.receiveQtyLabel}</span>
                <span>{o.receiveBatch}</span>
              </div>
              {rows.map((row) => (
                <div key={row.itemId} className={styles.recvItemRow}>
                  <span className="text-sm font-medium text-gray-800 truncate">{row.productName}</span>
                  <span className={`${styles.right} text-sm text-gray-500`}>{row.remaining}</span>
                  <Input type="number" min={0} max={row.remaining} value={row.quantity} onChange={(e) => updateRow(row.itemId, { quantity: e.target.value })} className="text-right" />
                  <Input value={row.batchCode} onChange={(e) => updateRow(row.itemId, { batchCode: e.target.value })} placeholder={o.receiveBatchPlaceholder} />
                </div>
              ))}
            </div>
          )}

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{o.cancelBtn}</Button>
            <Button type="button" loading={loading} onClick={handleSubmit} disabled={rows.length === 0} className="flex-1">{o.receiveConfirm}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
