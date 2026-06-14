import { useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { accountsService } from '../../../services/finance/accounts.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon } from '../../../assets/icons'
import {
  PAYMENT_CATEGORIES,
  RECEIPT_CATEGORIES,
  type TransactionCategory,
} from '../../../services/finance/transactions.types'
import styles from './style.module.css'
import type { TransactionFormModalProps } from './type'
import type { FinancialAccount } from '../../../services/finance/accounts.types'

const num = (s: string) => Number(s) || 0

export default function TransactionFormModal({ open, type, onClose, onSubmit }: TransactionFormModalProps) {
  const { t } = useLanguage()
  const tr = t.finance.transactions
  const categories = type === 'receipt' ? RECEIPT_CATEGORIES : PAYMENT_CATEGORIES

  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  const [accountId, setAccountId] = useState('')
  const [category, setCategory] = useState<TransactionCategory>(categories[0])
  const [amount, setAmount] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setAccountId(''); setCategory(categories[0]); setAmount(''); setPartnerName('')
    setDate(new Date().toISOString().slice(0, 10)); setNote(''); setError('')
    accountsService.getAll({ limit: 1000, sortBy: 'name', sortDir: 'asc' }).then((r) => setAccounts(r.data)).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, type])

  if (!open) return null

  const handleSubmit = async () => {
    if (!accountId) { setError(tr.accountRequired); return }
    if (num(amount) <= 0) { setError(tr.amountRequired); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit({
        type,
        category,
        accountId,
        amount: num(amount),
        partnerName: partnerName.trim() || undefined,
        date: date || undefined,
        note: note.trim() || undefined,
      })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? tr.saveError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{type === 'receipt' ? tr.receiptTitle : tr.paymentTitle}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{tr.fAccount}</label>
              <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                <option value="">{t.finance.common.selectAccount}</option>
                {accounts.map((ac) => (<option key={ac.id} value={ac.id}>{ac.name} ({ac.code})</option>))}
              </Select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{tr.fCategory}</label>
              <Select value={category} onChange={(e) => setCategory(e.target.value as TransactionCategory)}>
                {categories.map((c) => (<option key={c} value={c}>{t.finance.category[c]}</option>))}
              </Select>
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{tr.fAmount}</label>
              <Input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="text-right" autoFocus />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{tr.fDate}</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{tr.fPartner} <span className={styles.optional}>{t.finance.common.optional}</span></label>
            <Input value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder={tr.partnerPlaceholder} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{tr.fNote} <span className={styles.optional}>{t.finance.common.optional}</span></label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{t.finance.common.cancel}</Button>
            <Button type="button" loading={loading} onClick={handleSubmit} className="flex-1">{tr.createBtn}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
