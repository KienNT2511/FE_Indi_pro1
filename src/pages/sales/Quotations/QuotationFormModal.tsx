import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { customersService } from '../../../services/customers/customers.service'
import { productsService } from '../../../services/products/products.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon, PlusIcon, TrashIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { QuotationFormModalProps, QuoteItemRow } from './type'
import type { Customer } from '../../../services/customers/customers.types'
import type { Product } from '../../../services/products/products.types'

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100
const num = (s: string) => Number(s) || 0
const newRow = (): QuoteItemRow => ({ key: crypto.randomUUID(), productId: '', quantity: '1', unitPrice: '' })

export default function QuotationFormModal({ open, onClose, onSubmit }: QuotationFormModalProps) {
  const { t, lang } = useLanguage()
  const q = t.sales.quotations

  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customerId, setCustomerId] = useState('')
  const [quoteDate, setQuoteDate] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [items, setItems] = useState<QuoteItemRow[]>([newRow()])
  const [discount, setDiscount] = useState('0')
  const [taxRate, setTaxRate] = useState('0')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fmt = useMemo(() => new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  useEffect(() => {
    if (!open) return
    setCustomerId(''); setQuoteDate(new Date().toISOString().slice(0, 10)); setValidUntil('')
    setItems([newRow()]); setDiscount('0'); setTaxRate('0'); setNote(''); setError('')
    customersService.getAll({ limit: 1000, sortBy: 'name', sortDir: 'asc' }).then((r) => setCustomers(r.data)).catch(() => {})
    productsService.getAll({ limit: 1000 }).then((r) => setProducts(r.data)).catch(() => {})
  }, [open])

  const productById = useMemo(() => {
    const m = new Map<string, Product>()
    products.forEach((p) => m.set(p.id, p))
    return m
  }, [products])

  const lineTotal = (row: QuoteItemRow) => round2(num(row.quantity) * num(row.unitPrice))
  const subtotal = round2(items.reduce((s, r) => s + lineTotal(r), 0))
  const taxableBase = Math.max(0, subtotal - num(discount))
  const taxAmount = round2((taxableBase * num(taxRate)) / 100)
  const total = round2(taxableBase + taxAmount)

  if (!open) return null

  const updateRow = (key: string, patch: Partial<QuoteItemRow>) =>
    setItems((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  const onPickProduct = (key: string, productId: string) => {
    const p = productById.get(productId)
    updateRow(key, { productId, unitPrice: p ? String(p.price) : '' })
  }
  const addRow = () => setItems((rows) => [...rows, newRow()])
  const removeRow = (key: string) => setItems((rows) => (rows.length > 1 ? rows.filter((r) => r.key !== key) : rows))

  const handleSubmit = async () => {
    if (!customerId) { setError(q.customerRequired); return }
    const validItems = items.filter((r) => r.productId && num(r.quantity) >= 1)
    if (validItems.length === 0) { setError(q.itemsRequired); return }
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
        quoteDate: quoteDate || undefined,
        validUntil: validUntil || undefined,
        discount: num(discount),
        taxRate: num(taxRate),
        note: note.trim() || undefined,
      })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? q.saveError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.modal} ${styles.modalWide}`}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{q.createTitle}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{q.fCustomer}</label>
              <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">{t.sales.common.selectCustomer}</option>
                {customers.map((c) => (<option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ''}</option>))}
              </Select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{q.fQuoteDate}</label>
              <Input type="date" value={quoteDate} onChange={(e) => setQuoteDate(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{q.fValidUntil} <span className={styles.optional}>{t.sales.common.optional}</span></label>
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </div>
          </div>

          <div className={styles.itemsSection}>
            <div className={styles.itemsHeader}>
              <span className={styles.label}>{q.itemsTitle}</span>
              <Button type="button" variant="outline" onClick={addRow} className="w-auto px-3 py-1.5 gap-1.5 min-h-0">
                <PlusIcon size={14} /> {q.addItem}
              </Button>
            </div>
            <div className={styles.itemsTable}>
              <div className={`${styles.poItemRow} ${styles.itemHead}`}>
                <span>{q.iProduct}</span>
                <span className={styles.right}>{q.iQty}</span>
                <span className={styles.right}>{q.iUnitPrice}</span>
                <span className={styles.right}>{q.iLineTotal}</span>
                <span />
              </div>
              {items.map((row) => (
                <div key={row.key} className={styles.poItemRow}>
                  <Select value={row.productId} onChange={(e) => onPickProduct(row.key, e.target.value)}>
                    <option value="">{t.sales.common.selectProduct}</option>
                    {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </Select>
                  <Input type="number" min={1} value={row.quantity} onChange={(e) => updateRow(row.key, { quantity: e.target.value })} className="text-right" />
                  <Input type="number" min={0} step="0.01" value={row.unitPrice} onChange={(e) => updateRow(row.key, { unitPrice: e.target.value })} className="text-right" />
                  <span className={`${styles.lineTotal} ${styles.right}`}>{fmt.format(lineTotal(row))}</span>
                  <button type="button" className={styles.rowRemove} onClick={() => removeRow(row.key)} title={q.deleteAction}><TrashIcon size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryInputs}>
              <div className={styles.field}>
                <label className={styles.label}>{q.discount}</label>
                <Input type="number" min={0} step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} className="text-right" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{q.taxRate}</label>
                <Input type="number" min={0} step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="text-right" />
              </div>
            </div>
            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}><span>{q.subtotal}</span><span>{fmt.format(subtotal)}</span></div>
              <div className={styles.summaryRow}><span>{q.discount}</span><span>-{fmt.format(num(discount))}</span></div>
              <div className={styles.summaryRow}><span>{q.taxAmount}</span><span>{fmt.format(taxAmount)}</span></div>
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}><span>{q.totalLabel}</span><span>{fmt.format(total)}</span></div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{q.fNote} <span className={styles.optional}>{t.sales.common.optional}</span></label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{q.cancelBtn}</Button>
            <Button type="button" loading={loading} onClick={handleSubmit} className="flex-1">{q.createBtn}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
