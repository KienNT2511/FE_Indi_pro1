import { useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { customersService } from '../../../services/customers/customers.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon } from '../../../assets/icons'
import { INTERACTION_TYPES, type InteractionType } from '../../../services/sales/interactions.types'
import styles from './style.module.css'
import type { InteractionFormModalProps } from './type'
import type { Customer } from '../../../services/customers/customers.types'

export default function InteractionFormModal({ open, interaction, onClose, onSubmit }: InteractionFormModalProps) {
  const { t } = useLanguage()
  const c = t.sales.crm
  const isEdit = interaction !== null

  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState('')
  const [type, setType] = useState<InteractionType>('call')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [interactionDate, setInteractionDate] = useState('')
  const [nextFollowUp, setNextFollowUp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setCustomerId(interaction?.customerId ?? '')
    setType(interaction?.type ?? 'call')
    setSubject(interaction?.subject ?? '')
    setContent(interaction?.content ?? '')
    setInteractionDate(interaction ? interaction.interactionDate.slice(0, 10) : new Date().toISOString().slice(0, 10))
    setNextFollowUp(interaction?.nextFollowUp ?? '')
    setError('')
    customersService.getAll({ limit: 1000, sortBy: 'name', sortDir: 'asc' }).then((r) => setCustomers(r.data)).catch(() => {})
  }, [open, interaction])

  if (!open) return null

  const handleSubmit = async () => {
    if (!customerId) { setError(c.customerRequired); return }
    if (!subject.trim()) { setError(c.subjectRequired); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit({
        customerId,
        type,
        subject: subject.trim(),
        content: content.trim() || undefined,
        interactionDate: interactionDate || undefined,
        nextFollowUp: nextFollowUp || undefined,
      })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? c.saveError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{isEdit ? c.editTitle : c.createTitle}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{c.fCustomer}</label>
              <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} disabled={isEdit}>
                <option value="">{t.sales.common.selectCustomer}</option>
                {customers.map((cu) => (<option key={cu.id} value={cu.id}>{cu.name}</option>))}
              </Select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{c.fType}</label>
              <Select value={type} onChange={(e) => setType(e.target.value as InteractionType)}>
                {INTERACTION_TYPES.map((it) => (<option key={it} value={it}>{c.type[it]}</option>))}
              </Select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{c.fSubject}</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={c.subjectPlaceholder} autoFocus />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{c.fContent} <span className={styles.optional}>{t.sales.common.optional}</span></label>
            <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder={c.contentPlaceholder} />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{c.fDate}</label>
              <Input type="date" value={interactionDate} onChange={(e) => setInteractionDate(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{c.fFollowUp} <span className={styles.optional}>{t.sales.common.optional}</span></label>
              <Input type="date" value={nextFollowUp} onChange={(e) => setNextFollowUp(e.target.value)} />
            </div>
          </div>

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{c.cancelBtn}</Button>
            <Button type="button" loading={loading} onClick={handleSubmit} className="flex-1">{isEdit ? t.sales.common.save : c.createBtn}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
