import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { warehousesService } from '../../../services/inventory/warehouses.service'
import { productsService } from '../../../services/products/products.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon, PlusIcon, TrashIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { StockDocFormModalProps, DocItemRow } from './type'
import type { Warehouse } from '../../../services/inventory/warehouses.types'
import type { Product } from '../../../services/products/products.types'

const num = (s: string) => Number(s) || 0
const newRow = (): DocItemRow => ({ key: crypto.randomUUID(), productId: '', batchCode: '', quantity: '1' })

export default function StockDocFormModal({ open, docType, onClose, onSubmit }: StockDocFormModalProps) {
  const { t } = useLanguage()
  const d = t.inventory.docs
  const typeText = d[docType]
  const isTransfer = docType === 'transfer'
  const isCount = docType === 'count'

  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [warehouseId, setWarehouseId] = useState('')
  const [counterWarehouseId, setCounterWarehouseId] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [reason, setReason] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [items, setItems] = useState<DocItemRow[]>([newRow()])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setWarehouseId(''); setCounterWarehouseId(''); setPartnerName(''); setReason('')
    setDate(new Date().toISOString().slice(0, 10)); setNote(''); setItems([newRow()]); setError('')
    warehousesService.getAll({ limit: 1000, sortBy: 'name', sortDir: 'asc' }).then((r) => setWarehouses(r.data)).catch(() => {})
    productsService.getAll({ limit: 1000 }).then((r) => setProducts(r.data)).catch(() => {})
  }, [open])

  const qtyLabel = useMemo(() => (isCount ? d.iCountedQty : d.iQty), [isCount, d])

  if (!open) return null

  const updateRow = (key: string, patch: Partial<DocItemRow>) =>
    setItems((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  const addRow = () => setItems((rows) => [...rows, newRow()])
  const removeRow = (key: string) => setItems((rows) => (rows.length > 1 ? rows.filter((r) => r.key !== key) : rows))

  const handleSubmit = async () => {
    if (!warehouseId) { setError(d.warehouseRequired); return }
    if (isTransfer && !counterWarehouseId) { setError(d.counterRequired); return }
    const validItems = items.filter((r) => r.productId && num(r.quantity) >= 0)
    if (validItems.length === 0) { setError(d.itemsRequired); return }

    setError('')
    setLoading(true)
    try {
      await onSubmit({
        type: docType,
        warehouseId,
        counterWarehouseId: isTransfer ? counterWarehouseId : undefined,
        partnerName: partnerName.trim() || undefined,
        reason: reason.trim() || undefined,
        date: date || undefined,
        note: note.trim() || undefined,
        items: validItems.map((r) => ({
          productId: r.productId,
          batchCode: r.batchCode.trim() || undefined,
          quantity: Math.round(num(r.quantity)),
        })),
      })
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
          <h3 className={styles.modalTitle}>{typeText.createTitle}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{isTransfer ? `${d.fWarehouse} (${t.inventory.common.selectWarehouse})` : d.fWarehouse}</label>
              <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
                <option value="">{t.inventory.common.selectWarehouse}</option>
                {warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
              </Select>
            </div>
            {isTransfer && (
              <div className={styles.field}>
                <label className={styles.label}>{d.fCounterWarehouse}</label>
                <Select value={counterWarehouseId} onChange={(e) => setCounterWarehouseId(e.target.value)}>
                  <option value="">{t.inventory.common.selectWarehouse}</option>
                  {warehouses.filter((w) => w.id !== warehouseId).map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
                </Select>
              </div>
            )}
            <div className={styles.field}>
              <label className={styles.label}>{d.fDate}</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{typeText.partnerLabel} <span className={styles.optional}>{t.inventory.common.optional}</span></label>
              <Input value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder={typeText.partnerPlaceholder} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{d.fReason} <span className={styles.optional}>{t.inventory.common.optional}</span></label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={d.reasonPlaceholder} />
            </div>
          </div>

          {/* Dòng hàng */}
          <div className={styles.itemsSection}>
            <div className={styles.itemsHeader}>
              <span className={styles.label}>{d.itemsTitle}</span>
              <Button type="button" variant="outline" onClick={addRow} className="w-auto px-3 py-1.5 gap-1.5 min-h-0">
                <PlusIcon size={14} /> {d.addItem}
              </Button>
            </div>

            <div className={styles.itemsTable}>
              <div className={`${styles.itemRow} ${styles.itemHead}`}>
                <span>{d.iProduct}</span>
                <span>{d.iBatch}</span>
                <span className={styles.right}>{qtyLabel}</span>
                <span />
              </div>

              {items.map((row) => (
                <div key={row.key} className={styles.itemRow}>
                  <Select value={row.productId} onChange={(e) => updateRow(row.key, { productId: e.target.value })}>
                    <option value="">{t.inventory.common.selectProduct}</option>
                    {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </Select>
                  <Input value={row.batchCode} onChange={(e) => updateRow(row.key, { batchCode: e.target.value })} placeholder={d.iBatchPlaceholder} />
                  <Input type="number" min={0} value={row.quantity} onChange={(e) => updateRow(row.key, { quantity: e.target.value })} className="text-right" />
                  <button type="button" className={styles.rowRemove} onClick={() => removeRow(row.key)} title={d.deleteAction}>
                    <TrashIcon size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{d.fNote} <span className={styles.optional}>{t.inventory.common.optional}</span></label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={d.notePlaceholder} />
          </div>

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{d.cancelBtn}</Button>
            <Button type="button" loading={loading} onClick={handleSubmit} className="flex-1">{d.createBtn}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
