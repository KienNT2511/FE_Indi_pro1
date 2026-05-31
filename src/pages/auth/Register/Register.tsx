import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import AuthLayout from '../../../components/layout/AuthLayout/AuthLayout'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Alert from '../../../components/ui/Alert/Alert'
import { UserIcon, EmailIcon, LockIcon, EyeIcon } from '../../../assets/icons'
import styles from './style.module.css'

export default function Register() {
  const { register } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) { setError(t.auth.register.mismatch); return }
    setError('')
    setLoading(true)
    try {
      await register(email, password, name || undefined)
      navigate('/login')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? t.auth.register.error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={t.auth.register.title}
      subtitle={t.auth.register.subtitle}
      footerText={t.auth.register.footerText}
      footerLinkLabel={t.auth.register.footerLink}
      footerLinkTo="/login"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>
            {t.auth.register.name}{' '}
            <span className={styles.labelOptional}>{t.auth.register.nameOptional}</span>
          </label>
          <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.auth.register.namePlaceholder} startIcon={<UserIcon />} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{t.auth.register.email}</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required startIcon={<EmailIcon />} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{t.auth.register.password}</label>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.auth.register.passwordPlaceholder}
            required
            minLength={6}
            startIcon={<LockIcon strokeWidth={1.8} />}
            endIcon={
              <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)} className="opacity-60 hover:opacity-100 transition-opacity">
                <EyeIcon open={showPassword} />
              </button>
            }
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{t.auth.register.confirmPassword}</label>
          <Input
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t.auth.register.confirmPlaceholder}
            required
            error={passwordMismatch}
            startIcon={<LockIcon strokeWidth={1.8} />}
            endIcon={
              <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)} className="opacity-60 hover:opacity-100 transition-opacity">
                <EyeIcon open={showConfirm} />
              </button>
            }
          />
          {passwordMismatch && <span className={styles.mismatch}>{t.auth.register.mismatch}</span>}
        </div>

        {error && <Alert message={error} />}

        <Button type="submit" loading={loading} className="mt-1">
          {t.auth.register.submit}
        </Button>
      </form>
    </AuthLayout>
  )
}
