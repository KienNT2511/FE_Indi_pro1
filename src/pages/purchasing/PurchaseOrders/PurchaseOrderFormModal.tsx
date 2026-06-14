import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { suppliersService } from '../../../services/purchasing/suppliers.service'
import { productsService } from '../../../services/products/products.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon, PlusIcon, TrashIcon } from '../../../assets/icons'
import { PAYMENT_METHODS, type PaymentMethod } from '../../../services/orders/orders.types'
import styles from './style.module.css'
import type { PoFormModalProps, PoItemRow } from './type'
import type { Supplier } from '../../../services/purchasing/suppliers.types'
import type { Product } from '../../../services/products/products.types'

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100
const num = (s: string) => Number(s) || 0
const newRow = (): PoItemRow => ({ key: crypto.randomUUID(), productId: '', quantity: '1', unitCost: '' })

export default function PurchaseOrderFormModal({ open, onClose, onSubmit }: PoFormModalProps) {
  const { t, lang } = useLanguage()
  const o = t.purchasing.orders

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [supplierId, setSupplierId] = useState('')
  const [orderDate, setOrderDate] = useState('')
  const [expectedDate, setExpectedDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer')
  const [items, setItems] = useState<PoItemRow[]>([newRow()])
  const [discount, setDiscount] = useState('0')
  const [taxRate, setTaxRate] = useState('0')
  const [shippingFee, setShippingFee] = useState('0')
  const [amountPaid, setAmountPaid] = useState('0')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fmt = useMemo(() => new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  useEffect(() => {
    if (!open) return
    setSupplierId(''); setOrderDate(new Date().toISOString().slice(0, 10)); setExpectedDate('')
    setPaymentMethod('bank_transfer'); setItems([newRow()])
    setDiscount('0'); setTaxRate('0'); setShippingFee('0'); setAmountPaid('0'); setNote(''); setError('')
    suppliersService.getAll({ limit: 1000, sortBy: 'name', sortDir: 'asc' }).then((r) => setSuppliers(r.data)).catch(() => {})
    productsService.getAll({ limit: 1000 }).then((r) => setProducts(r.data)).catch(() => {})
  }, [open])

  const lineTotal = (row: PoItemRow) => round2(num(row.quantity) * num(row.unitCost))
  const subtotal = round2(items.reduce((s, r) => s + lineTotal(r), 0))
  const taxableBase = Math.max(0, subtotal - num(discount))
  const taxAmount = round2((taxableBase * num(taxRate)) / 100)
  const total = round2(taxableBase + taxAmount + num(shippingFee))
  const remaining = round2(total - num(amountPaid))

  if (!open) return null

  const updateRow = (key: string, patch: Partial<PoItemRow>) =>
    setItems((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  const addRow = () => setItems((rows) => [...rows, newRow()])
  const removeRow = (key: string) => setItems((rows) => (rows.length > 1 ? rows.filter((r) => r.key !== key) : rows))

  const handleSubmit = async () => {
    if (!supplierId) { setError(o.supplierRequired); return }
    const validItems = items.filter((r) => r.productId && num(r.quantity) >= 1)
    if (validItems.length === 0) { setError(o.itemsRequired); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit({
        supplierId,
        items: validItems.map((r) => ({
          productId: r.productId,
          quantity: Math.round(num(r.quantity)),
          unitCost: r.unitCost !== '' ? num(r.unitCost) : undefined,
        })),
        paymentMethod,
        orderDate: orderDate || undefined,
        expectedDate: expectedDate || undefined,
        discount: num(discount),
        taxRate: num(taxRate),
        shippingFee: num(shippingFee),
        amountPaid: num(amountPaid),
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
              <label className={styles.label}>{o.fSupplier}</label>
              <Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">{t.purchasing.common.selectSupplier}</option>
                {suppliers.map((sp) => (<option key={sp.id} value={sp.id}>{sp.name}{sp.phone ? ` · ${sp.phone}` : ''}</option>))}
              </Select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{o.fOrderDate}</label>
              <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{o.fExpectedDate} <span className={styles.optional}>{t.purchasing.common.optional}</span></label>
              <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
            </div>
          </div>

          <div className={styles.itemsSection}>
            <div className={styles.itemsHeader}>
              <span className={styles.label}>{o.itemsTitle}</span>
              <Button type="button" variant="outline" onClick={addRow} className="w-auto px-3 py-1.5 gap-1.5 min-h-0">
                <PlusIcon size={14} /> {o.addItem}
              </Button>
            </div>
            <div className={styles.itemsTable}>
              <div className={`${styles.poItemRow} ${styles.itemHead}`}>
                <span>{o.iProduct}</span>
                <span className={styles.right}>{o.iQty}</span>
                <span className={styles.right}>{o.iUnitCost}</span>
                <span className={styles.right}>{o.iLineTotal}</span>
                <span />
              </div>
              {items.map((row) => (
                <div key={row.key} className={styles.poItemRow}>
                  <Select value={row.productId} onChange={(e) => updateRow(row.key, { productId: e.target.value })}>
                    <option value="">{t.purchasing.common.selectProduct}</option>
                    {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </Select>
                  <Input type="number" min={1} value={row.quantity} onChange={(e) => updateRow(row.key, { quantity: e.target.value })} className="text-right" />
                  <Input type="number" min={0} step="0.01" value={row.unitCost} onChange={(e) => updateRow(row.key, { unitCost: e.target.value })} className="text-right" />
                  <span className={`${styles.lineTotal} ${styles.right}`}>{fmt.format(lineTotal(row))}</span>
                  <button type="button" className={styles.rowRemove} onClick={() => removeRow(row.key)} title={o.deleteAction}><TrashIcon size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryInputs}>
              <div className={styles.field}>
                <label className={styles.label}>{o.fPaymentMethod}</label>
                <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                  {PAYMENT_METHODS.map((m) => (<option key={m} value={m}>{t.orders.payMethod[m]}</option>))}
                </Select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{o.discount}</label>
                <Input type="number" min={0} step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} className="text-right" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{o.taxRate}</label>
                <Input type="number" min={0} step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="text-right" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{o.shippingFee}</label>
                <Input type="number" min={0} step="0.01" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} className="text-right" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{o.amountPaid}</label>
                <Input type="number" min={0} step="0.01" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className="text-right" />
              </div>
            </div>

            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}><span>{o.subtotal}</span><span>{fmt.format(subtotal)}</span></div>
              <div className={styles.summaryRow}><span>{o.discount}</span><span>-{fmt.format(num(discount))}</span></div>
              <div className={styles.summaryRow}><span>{o.taxAmount}</span><span>{fmt.format(taxAmount)}</span></div>
              <div className={styles.summaryRow}><span>{o.shippingFee}</span><span>{fmt.format(num(shippingFee))}</span></div>
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}><span>{o.totalLabel}</span><span>{fmt.format(total)}</span></div>
              <div className={styles.summaryRow}><span>{o.amountPaid}</span><span>{fmt.format(num(amountPaid))}</span></div>
              <div className={`${styles.summaryRow} ${styles.summaryRemaining}`}><span>{o.remaining}</span><span>{fmt.format(remaining)}</span></div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{o.fNote} <span className={styles.optional}>{t.purchasing.common.optional}</span></label>
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
