import { useEffect, useState, type FormEvent } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Select from '../../../components/ui/Select/Select'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon } from '../../../assets/icons'
import { ACCOUNT_TYPES, type AccountType } from '../../../services/finance/accounts.types'
import styles from './style.module.css'
import type { AccountFormModalProps } from './type'

export default function AccountFormModal({ open, account, onClose, onSubmit }: AccountFormModalProps) {
  const { t } = useLanguage()
  const a = t.finance.accounts
  const isEdit = account !== null

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('cash')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [openingBalance, setOpeningBalance] = useState('0')
  const [isActive, setIsActive] = useState(true)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setCode(account?.code ?? '')
    setName(account?.name ?? '')
    setType(account?.type ?? 'cash')
    setBankName(account?.bankName ?? '')
    setAccountNumber(account?.accountNumber ?? '')
    setOpeningBalance(account != null ? String(account.openingBalance) : '0')
    setIsActive(account?.isActive ?? true)
    setNote(account?.note ?? '')
    setError('')
  }, [open, account])

  if (!open) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim()) { setError(a.codeRequired); return }
    if (!name.trim()) { setError(a.nameRequired); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit({
        code: code.trim(),
        name: name.trim(),
        type,
        bankName: bankName.trim() || undefined,
        accountNumber: accountNumber.trim() || undefined,
        openingBalance: Number(openingBalance) || 0,
        isActive,
        note: note.trim() || undefined,
      })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? a.saveError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{isEdit ? a.editTitle : a.createTitle}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}><CloseIcon size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{a.fCode}</label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder={a.codePlaceholder} autoFocus />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{a.fName}</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={a.namePlaceholder} />
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>{a.fType}</label>
              <Select value={type} onChange={(e) => setType(e.target.value as AccountType)}>
                {ACCOUNT_TYPES.map((tp) => (<option key={tp} value={tp}>{t.finance.accountType[tp]}</option>))}
              </Select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{a.fOpeningBalance}</label>
              <Input type="number" step="0.01" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} className="text-right" disabled={isEdit} />
            </div>
          </div>

          {type === 'bank' && (
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>{a.fBankName} <span className={styles.optional}>{t.finance.common.optional}</span></label>
                <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder={a.bankPlaceholder} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{a.fAccountNumber} <span className={styles.optional}>{t.finance.common.optional}</span></label>
                <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder={a.accountNumberPlaceholder} />
              </div>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>{a.fNote} <span className={styles.optional}>{t.finance.common.optional}</span></label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={a.notePlaceholder} />
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span className={styles.label}>{a.fActive}</span>
          </label>

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">{t.finance.common.cancel}</Button>
            <Button type="submit" loading={loading} className="flex-1">{isEdit ? t.finance.common.save : t.finance.common.create}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
