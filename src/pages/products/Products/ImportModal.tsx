import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { productsService } from '../../../services/products/products.service'
import Button from '../../../components/ui/Button/Button'
import Alert from '../../../components/ui/Alert/Alert'
import { CloseIcon, UploadIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { ImportModalProps } from './type'
import type { ImportResult } from '../../../services/products/products.types'

export default function ImportModal({ open, onClose, onUploaded }: ImportModalProps) {
  const { t } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Reset state mỗi lần mở modal
  useEffect(() => {
    if (!open) return
    setFile(null)
    setResult(null)
    setError('')
  }, [open])

  if (!open) return null

  const handleUpload = async () => {
    if (!file) return
    setError('')
    setLoading(true)
    try {
      const res = await productsService.uploadExcel(file)
      setResult(res)
      onUploaded()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? t.products.importError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{t.products.importTitle}</h3>
          <button type="button" onClick={onClose} className={styles.modalClose}>
            <CloseIcon size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.importDesc}>{t.products.importDesc}</p>

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null) }}
          />

          <button type="button" className={styles.dropzone} onClick={() => inputRef.current?.click()}>
            <span className={styles.dropzoneIcon}><UploadIcon size={28} /></span>
            <span className={styles.dropzoneText}>{file ? file.name : t.products.chooseFile}</span>
          </button>

          {result && (
            <div className={styles.importResult}>
              <div className={styles.importStats}>
                <span className={styles.importOk}>{t.products.importedLabel}: {result.inserted}</span>
                <span className={styles.importFail}>{t.products.failedLabel}: {result.failed}</span>
              </div>
              {result.errors.length > 0 && (
                <ul className={styles.errorList}>
                  {result.errors.map((er) => (
                    <li key={er.row} className={styles.errorItem}>
                      {t.products.rowLabel} {er.row}: {er.reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {error && <Alert type="error" message={error} />}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              {result ? t.products.close : t.products.cancelBtn}
            </Button>
            {!result && (
              <Button type="button" loading={loading} disabled={!file} onClick={handleUpload} className="flex-1">
                {t.products.uploadBtn}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
