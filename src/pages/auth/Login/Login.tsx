import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import AuthLayout from '../../../components/layout/AuthLayout/AuthLayout'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Alert from '../../../components/ui/Alert/Alert'
import { EmailIcon, LockIcon, EyeIcon } from '../../../assets/icons'
import styles from './style.module.css'

export default function Login() {
  const { login } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? t.auth.login.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={t.auth.login.title}
      subtitle={t.auth.login.subtitle}
      footerText={t.auth.login.footerText}
      footerLinkLabel={t.auth.login.footerLink}
      footerLinkTo="/register"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>{t.auth.login.email}</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required startIcon={<EmailIcon />} />
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label}>{t.auth.login.password}</label>
            <span className={styles.forgotPassword}>{t.auth.login.forgotPassword}</span>
          </div>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            startIcon={<LockIcon strokeWidth={1.8} />}
            endIcon={
              <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)} className="opacity-60 hover:opacity-100 transition-opacity">
                <EyeIcon open={showPassword} />
              </button>
            }
          />
        </div>

        {error && <Alert message={error} />}

        <Button type="submit" loading={loading} className="mt-1">
          {t.auth.login.submit}
        </Button>
      </form>
    </AuthLayout>
  )
}
