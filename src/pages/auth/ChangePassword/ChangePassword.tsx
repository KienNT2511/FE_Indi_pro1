import { useState, type FormEvent } from 'react'
import { authService } from '../../../services/auth/auth.service'
import { useLanguage } from '../../../context/LanguageContext'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Alert from '../../../components/ui/Alert/Alert'
import { LockIcon, EyeIcon, InfoCircleIcon, WarningCircleIcon, CheckCircleIcon, StrengthCheckIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { PasswordStrengthProps } from './type'

function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useLanguage()
  const checks = [
    { label: t.strength.minLength, pass: password.length >= 6 },
    { label: t.strength.uppercase, pass: /[A-Z]/.test(password) },
    { label: t.strength.number,    pass: /[0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length
  const barColors  = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
  const textColors = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-500']
  const labels = [t.strength.weak, t.strength.medium, t.strength.fair, t.strength.strong]

  if (!password) return null

  return (
    <div className={styles.strengthWrapper}>
      <div className={styles.strengthBars}>
        {[0, 1, 2].map(i => (
          <div key={i} className={`${styles.strengthBar} ${i < score ? barColors[score] : 'bg-gray-200'}`} />
        ))}
      </div>
      <div className={styles.strengthMeta}>
        <div className={styles.strengthChecks}>
          {checks.map(c => (
            <span key={c.label} className={`${styles.strengthCheck} ${c.pass ? 'text-green-500' : 'text-gray-400'}`}>
              <StrengthCheckIcon pass={c.pass} />
              {c.label}
            </span>
          ))}
        </div>
        <span className={`text-xs font-semibold ${textColors[score]}`}>{labels[score]}</span>
      </div>
    </div>
  )
}

export default function ChangePassword() {
  const { t } = useLanguage()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setError(t.changePassword.mismatch); return }
    setError('')
    setSuccess(false)
    setLoading(true)
    try {
      await authService.changePassword({ currentPassword, newPassword })
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? t.changePassword.error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t.changePassword.title}</h1>
        <p className={styles.pageSubtitle}>{t.changePassword.subtitle}</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.formCard}>
          <div className={styles.formCardHeader}>
            <h2 className={styles.formCardTitle}>{t.changePassword.sectionTitle}</h2>
          </div>

          <form onSubmit={handleSubmit} className={styles.formBody}>
            <div className={styles.field}>
              <label className={styles.label}>{t.changePassword.currentPassword}</label>
              <Input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t.changePassword.currentPlaceholder}
                required
                startIcon={<LockIcon strokeWidth={1.8} />}
                endIcon={
                  <button type="button" tabIndex={-1} onClick={() => setShowCurrent(v => !v)} className="opacity-60 hover:opacity-100 transition-opacity">
                    <EyeIcon open={showCurrent} />
                  </button>
                }
              />
            </div>

            <div className={styles.divider} />

            <div className={styles.field}>
              <label className={styles.label}>{t.changePassword.newPassword}</label>
              <Input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t.changePassword.newPlaceholder}
                required
                minLength={6}
                startIcon={<LockIcon strokeWidth={1.8} />}
                endIcon={
                  <button type="button" tabIndex={-1} onClick={() => setShowNew(v => !v)} className="opacity-60 hover:opacity-100 transition-opacity">
                    <EyeIcon open={showNew} />
                  </button>
                }
              />
              <PasswordStrength password={newPassword} />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t.changePassword.confirmPassword}</label>
              <Input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.changePassword.confirmPlaceholder}
                required
                error={passwordMismatch}
                startIcon={<LockIcon strokeWidth={1.8} />}
                endIcon={
                  <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)} className="opacity-60 hover:opacity-100 transition-opacity">
                    <EyeIcon open={showConfirm} />
                  </button>
                }
              />
              {passwordMismatch && (
                <span className={styles.mismatch}>
                  <WarningCircleIcon />
                  {t.changePassword.mismatch}
                </span>
              )}
            </div>

            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={t.changePassword.success} />}

            <div className={styles.formFooter}>
              <Button type="submit" loading={loading} className="w-auto px-8">
                {t.changePassword.submit}
              </Button>
            </div>
          </form>
        </div>

        <div className={styles.tipsCard}>
          <div className={styles.tipsHeader}>
            <div className={styles.tipsIconBox}>
              <InfoCircleIcon color="#6366f1" />
            </div>
            <h3 className={styles.tipsTitle}>{t.changePassword.tipsTitle}</h3>
          </div>
          <ul className={styles.tipsList}>
            {t.changePassword.tips.map(tip => (
              <li key={tip} className={styles.tipItem}>
                <CheckCircleIcon />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
