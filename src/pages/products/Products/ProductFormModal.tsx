import { useEffect, useState, type FormEvent } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { ProductFormModalProps } from './type'

export default function ProductFormModal({ open, product, onClose, onSubmit }: ProductFormModalProps) {
  const { t } = useLanguage()
  const isEdit = product !== null

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [cost, setCost] = useState('')
  const [quantity, setQuantity] = useState('')
  const [minStock, setMinStock] = useState('')
  const [unit, setUnit] = useState('')
  const [material, setMaterial] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Đồng bộ form mỗi khi mở modal hoặc đổi sản phẩm đang sửa
  useEffect(() => {
    if (!open) return
    setName(product?.name ?? '')
    setPrice(product != null ? String(product.price) : '')
    setCost(product != null ? String(product.cost) : '')
    setQuantity(product != null ? String(product.quantity) : '')
    setMinStock(product != null ? String(product.minStock) : '')
    setUnit(product?.unit ?? '')
    setMaterial(product?.material ?? '')
    setCategory(product?.category ?? '')
    setError('')
  }, [open, product])

  if (!open) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError(t.products.nameRequired); return }
    if (!category.trim()) { setError(t.products.categoryRequired); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        price: Number(price) || 0,
        cost: Number(cost) || 0,
        quantity: Math.round(Number(quantity) || 0),
        minStock: Math.round(Number(minStock) || 0),
        unit: unit.trim() ? unit.trim() : undefined,
        material: material.trim() ? material.trim() : undefined,
        category: category.trim(),
      })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? t.products.saveError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{isEdit ? t.products.editTitle : t.products.createTitle}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}>
            <CloseIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.field}>
            <label className={styles.label}>{t.products.fName}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.products.namePlaceholder}
              autoFocus
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{t.products.fPrice}</label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={t.products.pricePlaceholder}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t.products.fCost}</label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder={t.products.costPlaceholder}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t.products.fQuantity}</label>
              <Input
                type="number"
                min={0}
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={t.products.quantityPlaceholder}
              />
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{t.products.fMinStock}</label>
              <Input
                type="number"
                min={0}
                step="1"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                placeholder={t.products.minStockPlaceholder}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                {t.products.fUnit} <span className={styles.optional}>{t.products.unitOptional}</span>
              </label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder={t.products.unitPlaceholder}
              />
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>
                {t.products.fMaterial} <span className={styles.optional}>{t.products.materialOptional}</span>
              </label>
              <Input
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder={t.products.materialPlaceholder}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t.products.fCategory}</label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={t.products.categoryPlaceholder}
              />
            </div>
          </div>

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              {t.products.cancelBtn}
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              {isEdit ? t.products.saveBtn : t.products.createBtn}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
