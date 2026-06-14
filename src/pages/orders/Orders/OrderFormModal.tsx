import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { customersService } from '../../../services/customers/customers.service'
import { productsService } from '../../../services/products/products.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon, PlusIcon, TrashIcon } from '../../../assets/icons'
import { PAYMENT_METHODS } from '../../../services/orders/orders.types'
import styles from './style.module.css'
import type { OrderFormModalProps, ItemRow } from './type'
import type { Customer } from '../../../services/customers/customers.types'
import type { Product } from '../../../services/products/products.types'
import type { PaymentMethod } from '../../../services/orders/orders.types'

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100
const num = (s: string) => Number(s) || 0
const newRow = (): ItemRow => ({ key: crypto.randomUUID(), productId: '', quantity: '1', unitPrice: '' })

export default function OrderFormModal({ open, onClose, onSubmit }: OrderFormModalProps) {
  const { t, lang } = useLanguage()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [customerId, setCustomerId] = useState('')
  const [orderDate, setOrderDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [items, setItems] = useState<ItemRow[]>([newRow()])
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
    // reset form
    setCustomerId('')
    setOrderDate(new Date().toISOString().slice(0, 10))
    setPaymentMethod('cash')
    setItems([newRow()])
    setDiscount('0'); setTaxRate('0'); setShippingFee('0'); setAmountPaid('0')
    setNote(''); setError('')
    // load dữ liệu cho dropdown
    customersService.getAll({ limit: 1000, sortBy: 'name', sortDir: 'asc' }).then((r) => setCustomers(r.data)).catch(() => {})
    productsService.getAll({ limit: 1000 }).then((r) => setProducts(r.data)).catch(() => {})
  }, [open])

  const productById = useMemo(() => {
    const m = new Map<string, Product>()
    products.forEach((p) => m.set(p.id, p))
    return m
  }, [products])

  // ── tính tiền ──
  const lineTotal = (row: ItemRow) => round2(num(row.quantity) * num(row.unitPrice))
  const subtotal = round2(items.reduce((s, r) => s + lineTotal(r), 0))
  const taxableBase = Math.max(0, subtotal - num(discount))
  const taxAmount = round2((taxableBase * num(taxRate)) / 100)
  const total = round2(taxableBase + taxAmount + num(shippingFee))
  const remaining = round2(total - num(amountPaid))

  if (!open) return null

  const updateRow = (key: string, patch: Partial<ItemRow>) =>
    setItems((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  const onPickProduct = (key: string, productId: string) => {
    const p = productById.get(productId)
    updateRow(key, { productId, unitPrice: p ? String(p.price) : '' })
  }

  const addRow = () => setItems((rows) => [...rows, newRow()])
  const removeRow = (key: string) => setItems((rows) => (rows.length > 1 ? rows.filter((r) => r.key !== key) : rows))

  const handleSubmit = async () => {
    if (!customerId) { setError(t.orders.customerRequired); return }
    const validItems = items.filter((r) => r.productId && num(r.quantity) >= 1)
    if (validItems.length === 0) { setError(t.orders.itemsRequired); return }

    setError('')
    setLoading(true)
    try {
      await onSubmit({
        customerId,
        items: validItems.map((r) => ({
          productId: r.productId,
          quantity: Math.round(num(r.quantity)),
          unitPrice: r.unitPrice !== '' ? num(r.unitPrice) : undefined,
        })),
        paymentMethod,
        orderDate: orderDate || undefined,
        discount: num(discount),
        taxRate: num(taxRate),
        shippingFee: num(shippingFee),
        amountPaid: num(amountPaid),
        note: note.trim() || undefined,
      })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? t.orders.saveError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.modal} ${styles.modalWide}`}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{t.orders.createTitle}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          {/* Thông tin chung */}
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{t.orders.fCustomer}</label>
              <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">{t.orders.selectCustomer}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ''}</option>
                ))}
              </Select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t.orders.fOrderDate}</label>
              <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t.orders.fPaymentMethod}</label>
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{t.orders.payMethod[m]}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Dòng sản phẩm */}
          <div className={styles.itemsSection}>
            <div className={styles.itemsHeader}>
              <span className={styles.label}>{t.orders.itemsTitle}</span>
              <Button type="button" variant="outline" onClick={addRow} className="w-auto px-3 py-1.5 gap-1.5 min-h-0">
                <PlusIcon size={14} /> {t.orders.addItem}
              </Button>
            </div>

            <div className={styles.itemsTable}>
              <div className={`${styles.itemRow} ${styles.itemHead}`}>
                <span>{t.orders.colProduct}</span>
                <span className={styles.right}>{t.orders.colQty}</span>
                <span className={styles.right}>{t.orders.colUnitPrice}</span>
                <span className={styles.right}>{t.orders.colLineTotal}</span>
                <span />
              </div>

              {items.map((row) => (
                <div key={row.key} className={styles.itemRow}>
                  <Select value={row.productId} onChange={(e) => onPickProduct(row.key, e.target.value)}>
                    <option value="">{t.orders.selectProduct}</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Select>
                  <Input type="number" min={1} value={row.quantity} onChange={(e) => updateRow(row.key, { quantity: e.target.value })} className="text-right" />
                  <Input type="number" min={0} step="0.01" value={row.unitPrice} onChange={(e) => updateRow(row.key, { unitPrice: e.target.value })} className="text-right" />
                  <span className={`${styles.lineTotal} ${styles.right}`}>{fmt.format(lineTotal(row))}</span>
                  <button type="button" className={styles.rowRemove} onClick={() => removeRow(row.key)} title={t.orders.deleteAction}>
                    <TrashIcon size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tiền + ghi chú */}
          <div className={styles.summaryGrid}>
            <div className={styles.summaryInputs}>
              <div className={styles.field}>
                <label className={styles.label}>{t.orders.discount}</label>
                <Input type="number" min={0} step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} className="text-right" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t.orders.taxRate}</label>
                <Input type="number" min={0} step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="text-right" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t.orders.shippingFee}</label>
                <Input type="number" min={0} step="0.01" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} className="text-right" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t.orders.amountPaid}</label>
                <Input type="number" min={0} step="0.01" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className="text-right" />
              </div>
            </div>

            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}><span>{t.orders.subtotal}</span><span>{fmt.format(subtotal)}</span></div>
              <div className={styles.summaryRow}><span>{t.orders.discount}</span><span>-{fmt.format(num(discount))}</span></div>
              <div className={styles.summaryRow}><span>{t.orders.taxAmount}</span><span>{fmt.format(taxAmount)}</span></div>
              <div className={styles.summaryRow}><span>{t.orders.shippingFee}</span><span>{fmt.format(num(shippingFee))}</span></div>
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}><span>{t.orders.totalLabel}</span><span>{fmt.format(total)}</span></div>
              <div className={styles.summaryRow}><span>{t.orders.amountPaid}</span><span>{fmt.format(num(amountPaid))}</span></div>
              <div className={`${styles.summaryRow} ${styles.summaryRemaining}`}><span>{t.orders.remaining}</span><span>{fmt.format(remaining)}</span></div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t.orders.fNote} <span className={styles.optional}>{t.orders.optional}</span></label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{t.orders.cancelBtn}</Button>
            <Button type="button" loading={loading} onClick={handleSubmit} className="flex-1">{t.orders.createBtn}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
