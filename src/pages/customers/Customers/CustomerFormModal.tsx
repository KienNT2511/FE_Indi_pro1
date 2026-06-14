import { useEffect, useState, type FormEvent } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { CustomerFormModalProps } from './type'

export default function CustomerFormModal({ open, customer, onClose, onSubmit }: CustomerFormModalProps) {
  const { t } = useLanguage()
  const isEdit = customer !== null

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(customer?.name ?? '')
    setPhone(customer?.phone ?? '')
    setEmail(customer?.email ?? '')
    setAddress(customer?.address ?? '')
    setNote(customer?.note ?? '')
    setError('')
  }, [open, customer])

  if (!open) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError(t.customers.nameRequired); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        note: note.trim() || undefined,
      })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? t.customers.saveError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{isEdit ? t.customers.editTitle : t.customers.createTitle}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.field}>
            <label className={styles.label}>{t.customers.fName}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.customers.namePlaceholder} autoFocus />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{t.customers.fPhone} <span className={styles.optional}>{t.customers.optional}</span></label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.customers.phonePlaceholder} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t.customers.fEmail} <span className={styles.optional}>{t.customers.optional}</span></label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.customers.emailPlaceholder} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t.customers.fAddress} <span className={styles.optional}>{t.customers.optional}</span></label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t.customers.addressPlaceholder} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t.customers.fNote} <span className={styles.optional}>{t.customers.optional}</span></label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.customers.notePlaceholder} />
          </div>

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{t.customers.cancelBtn}</Button>
            <Button type="submit" loading={loading} className="flex-1">{isEdit ? t.customers.saveBtn : t.customers.createBtn}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
