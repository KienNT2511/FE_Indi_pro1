import { useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { ordersService } from '../../../services/orders/orders.service'
import { warehousesService } from '../../../services/inventory/warehouses.service'
import { deliveriesService } from '../../../services/sales/deliveries.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { DeliveryFormModalProps, DeliverRow } from './type'
import type { Order } from '../../../services/orders/orders.types'
import type { Warehouse } from '../../../services/inventory/warehouses.types'

const num = (s: string) => Number(s) || 0

export default function DeliveryFormModal({ open, onClose, onSubmit }: DeliveryFormModalProps) {
  const { t } = useLanguage()
  const d = t.sales.deliveries

  const [orders, setOrders] = useState<Order[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [orderId, setOrderId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [rows, setRows] = useState<DeliverRow[]>([])
  const [deliveryDate, setDeliveryDate] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingItems, setLoadingItems] = useState(false)

  useEffect(() => {
    if (!open) return
    setOrderId(''); setWarehouseId(''); setRows([]); setDeliveryDate(new Date().toISOString().slice(0, 10)); setNote(''); setError('')
    ordersService.getAll({ limit: 200, sortBy: 'createdAt', sortDir: 'desc' }).then((r) => setOrders(r.data.filter((o) => o.status !== 'cancelled'))).catch(() => {})
    warehousesService.getAll({ limit: 1000, sortBy: 'name', sortDir: 'asc' }).then((r) => setWarehouses(r.data)).catch(() => {})
  }, [open])

  const onPickOrder = async (id: string) => {
    setOrderId(id)
    setRows([])
    if (!id) return
    setLoadingItems(true)
    try {
      const res = await deliveriesService.getOrderDeliverable(id)
      setRows(
        res.items
          .filter((i) => i.remaining > 0)
          .map((i) => ({
            orderItemId: i.orderItemId,
            productName: i.productName,
            ordered: i.ordered,
            delivered: i.delivered,
            remaining: i.remaining,
            quantity: String(i.remaining),
            batchCode: '',
          })),
      )
    } catch {
      setError(d.loadError)
    } finally {
      setLoadingItems(false)
    }
  }

  if (!open) return null

  const updateRow = (orderItemId: string, patch: Partial<DeliverRow>) =>
    setRows((rs) => rs.map((r) => (r.orderItemId === orderItemId ? { ...r, ...patch } : r)))

  const handleSubmit = async () => {
    if (!orderId) { setError(d.orderRequired); return }
    if (!warehouseId) { setError(d.warehouseRequired); return }
    const items = rows
      .filter((r) => num(r.quantity) > 0)
      .map((r) => ({ orderItemId: r.orderItemId, quantity: Math.round(num(r.quantity)), batchCode: r.batchCode.trim() || undefined }))
    if (items.length === 0) { setError(d.itemsRequired); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit({ orderId, warehouseId, items, deliveryDate: deliveryDate || undefined, note: note.trim() || undefined })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? d.saveError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.modal} ${styles.modalWide}`}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{d.createTitle}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{d.fOrder}</label>
              <Select value={orderId} onChange={(e) => onPickOrder(e.target.value)}>
                <option value="">{d.selectOrder}</option>
                {orders.map((o) => (<option key={o.id} value={o.id}>{o.code} · {o.customer?.name ?? ''}</option>))}
              </Select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{d.fWarehouse}</label>
              <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
                <option value="">{d.selectWarehouse}</option>
                {warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
              </Select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{d.fDeliveryDate}</label>
              <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
            </div>
          </div>

          {orderId && !loadingItems && rows.length === 0 && <Alert type="info" message={d.nothingToDeliver} />}

          {rows.length > 0 && (
            <div className={styles.itemsSection}>
              <div className={`${styles.recvItemRow} ${styles.itemHead}`}>
                <span>{d.iProduct}</span>
                <span className={styles.right}>{d.iRemaining}</span>
                <span className={styles.right}>{d.iQty}</span>
                <span>{d.iBatch}</span>
              </div>
              {rows.map((row) => (
                <div key={row.orderItemId} className={styles.recvItemRow}>
                  <span className="text-sm font-medium text-gray-800 truncate">{row.productName}</span>
                  <span className={`${styles.right} text-sm text-gray-500`}>{row.remaining}</span>
                  <Input type="number" min={0} max={row.remaining} value={row.quantity} onChange={(e) => updateRow(row.orderItemId, { quantity: e.target.value })} className="text-right" />
                  <Input value={row.batchCode} onChange={(e) => updateRow(row.orderItemId, { batchCode: e.target.value })} placeholder={d.iBatchPlaceholder} />
                </div>
              ))}
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>{d.fNote} <span className={styles.optional}>{t.sales.common.optional}</span></label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{d.cancelBtn}</Button>
            <Button type="button" loading={loading} onClick={handleSubmit} disabled={rows.length === 0} className="flex-1">{d.createBtn}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
