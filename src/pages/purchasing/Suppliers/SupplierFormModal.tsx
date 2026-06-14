import { useEffect, useState, type FormEvent } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { SupplierFormModalProps } from './type'

export default function SupplierFormModal({ open, supplier, onClose, onSubmit }: SupplierFormModalProps) {
  const { t } = useLanguage()
  const s = t.purchasing.suppliers
  const isEdit = supplier !== null

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [taxCode, setTaxCode] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(supplier?.name ?? '')
    setPhone(supplier?.phone ?? '')
    setEmail(supplier?.email ?? '')
    setAddress(supplier?.address ?? '')
    setTaxCode(supplier?.taxCode ?? '')
    setNote(supplier?.note ?? '')
    setError('')
  }, [open, supplier])

  if (!open) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError(s.nameRequired); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        taxCode: taxCode.trim() || undefined,
        note: note.trim() || undefined,
      })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? s.saveError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{isEdit ? s.editTitle : s.createTitle}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.field}>
            <label className={styles.label}>{s.fName}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={s.namePlaceholder} autoFocus />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{s.fPhone} <span className={styles.optional}>{t.purchasing.common.optional}</span></label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={s.phonePlaceholder} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{s.fEmail} <span className={styles.optional}>{t.purchasing.common.optional}</span></label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={s.emailPlaceholder} />
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{s.fTaxCode} <span className={styles.optional}>{t.purchasing.common.optional}</span></label>
              <Input value={taxCode} onChange={(e) => setTaxCode(e.target.value)} placeholder={s.taxCodePlaceholder} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{s.fAddress} <span className={styles.optional}>{t.purchasing.common.optional}</span></label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={s.addressPlaceholder} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{s.fNote} <span className={styles.optional}>{t.purchasing.common.optional}</span></label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={s.notePlaceholder} />
          </div>

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{t.purchasing.common.cancel}</Button>
            <Button type="submit" loading={loading} className="flex-1">{isEdit ? t.purchasing.common.save : t.purchasing.common.create}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
