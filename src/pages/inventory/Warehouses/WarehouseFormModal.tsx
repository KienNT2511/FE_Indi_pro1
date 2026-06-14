import { useEffect, useState, type FormEvent } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { WarehouseFormModalProps } from './type'

export default function WarehouseFormModal({ open, warehouse, onClose, onSubmit }: WarehouseFormModalProps) {
  const { t } = useLanguage()
  const w = t.inventory.warehouses
  const isEdit = warehouse !== null

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setCode(warehouse?.code ?? '')
    setName(warehouse?.name ?? '')
    setAddress(warehouse?.address ?? '')
    setIsActive(warehouse?.isActive ?? true)
    setError('')
  }, [open, warehouse])

  if (!open) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim()) { setError(w.codeRequired); return }
    if (!name.trim()) { setError(w.nameRequired); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit({
        code: code.trim(),
        name: name.trim(),
        address: address.trim() || undefined,
        isActive,
      })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? w.saveError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{isEdit ? w.editTitle : w.createTitle}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{w.fCode}</label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder={w.codePlaceholder} autoFocus />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{w.fName}</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={w.namePlaceholder} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{w.fAddress} <span className={styles.optional}>{t.inventory.common.optional}</span></label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={w.addressPlaceholder} />
          </div>

          <label className={styles.checkboxField}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span className={styles.label}>{w.fActive}</span>
          </label>

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{t.inventory.common.cancel}</Button>
            <Button type="submit" loading={loading} className="flex-1">{isEdit ? t.inventory.common.save : t.inventory.common.create}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
