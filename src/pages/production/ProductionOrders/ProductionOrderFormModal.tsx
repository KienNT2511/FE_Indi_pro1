import { useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { productsService } from '../../../services/products/products.service'
import { warehousesService } from '../../../services/inventory/warehouses.service'
import { bomsService } from '../../../services/production/boms.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { ProductionOrderFormModalProps } from './type'
import type { Product } from '../../../services/products/products.types'
import type { Warehouse } from '../../../services/inventory/warehouses.types'
import type { BillOfMaterials } from '../../../services/production/boms.types'

const num = (s: string) => Number(s) || 0

export default function ProductionOrderFormModal({ open, onClose, onSubmit }: ProductionOrderFormModalProps) {
  const { t } = useLanguage()
  const o = t.production.orders

  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [boms, setBoms] = useState<BillOfMaterials[]>([])

  const [productId, setProductId] = useState('')
  const [bomId, setBomId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [plannedQty, setPlannedQty] = useState('1')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [laborCost, setLaborCost] = useState('0')
  const [overheadCost, setOverheadCost] = useState('0')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setProductId(''); setBomId(''); setWarehouseId(''); setPlannedQty('1')
    setStartDate(new Date().toISOString().slice(0, 10)); setDueDate('')
    setLaborCost('0'); setOverheadCost('0'); setNote(''); setError(''); setBoms([])
    productsService.getAll({ limit: 1000 }).then((r) => setProducts(r.data)).catch(() => {})
    warehousesService.getAll({ limit: 1000, sortBy: 'name', sortDir: 'asc' }).then((r) => setWarehouses(r.data)).catch(() => {})
  }, [open])

  const onPickProduct = async (id: string) => {
    setProductId(id)
    setBomId('')
    if (!id) { setBoms([]); return }
    try {
      const res = await bomsService.getAll({ productId: id, limit: 100 })
      setBoms(res.data)
    } catch { setBoms([]) }
  }

  if (!open) return null

  const handleSubmit = async () => {
    if (!productId) { setError(o.productRequired); return }
    if (!warehouseId) { setError(o.warehouseRequired); return }
    if (num(plannedQty) < 1) { setError(o.qtyRequired); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit({
        productId,
        bomId: bomId || undefined,
        warehouseId,
        plannedQty: Math.round(num(plannedQty)),
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        laborCost: num(laborCost),
        overheadCost: num(overheadCost),
        note: note.trim() || undefined,
      })
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
          <h3 className={styles.modalTitle}>{o.createTitle}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{o.fProduct}</label>
              <Select value={productId} onChange={(e) => onPickProduct(e.target.value)}>
                <option value="">{t.production.common.selectProduct}</option>
                {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </Select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{o.fBom}</label>
              <Select value={bomId} onChange={(e) => setBomId(e.target.value)} disabled={!productId}>
                <option value="">{o.noBom}</option>
                {boms.map((bm) => (<option key={bm.id} value={bm.id}>{bm.code} · {bm.name}</option>))}
              </Select>
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{o.fWarehouse}</label>
              <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
                <option value="">{t.production.common.selectWarehouse}</option>
                {warehouses.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
              </Select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{o.fPlannedQty}</label>
              <Input type="number" min={1} value={plannedQty} onChange={(e) => setPlannedQty(e.target.value)} className="text-right" />
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{o.fStartDate}</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{o.fDueDate} <span className={styles.optional}>{t.production.common.optional}</span></label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{o.fLaborCost}</label>
              <Input type="number" min={0} step="0.01" value={laborCost} onChange={(e) => setLaborCost(e.target.value)} className="text-right" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{o.fOverheadCost}</label>
              <Input type="number" min={0} step="0.01" value={overheadCost} onChange={(e) => setOverheadCost(e.target.value)} className="text-right" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{o.fNote} <span className={styles.optional}>{t.production.common.optional}</span></label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{o.cancelBtn}</Button>
            <Button type="button" loading={loading} onClick={handleSubmit} className="flex-1">{o.createBtn}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
