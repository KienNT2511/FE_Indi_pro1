import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { financeReportsService } from '../../../services/finance/reports.service'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input'
import Alert from '../../../components/ui/Alert/Alert'
import styles from './style.module.css'
import type { CashflowReport, FinanceSummary, IncomeStatement } from '../../../services/finance/reports.types'

export default function Reports() {
  const { t, lang } = useLanguage()
  const r = t.finance.reports

  const [summary, setSummary] = useState<FinanceSummary | null>(null)
  const [cashflow, setCashflow] = useState<CashflowReport | null>(null)
  const [income, setIncome] = useState<IncomeStatement | null>(null)
  const [loadError, setLoadError] = useState('')

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fmt = useMemo(() => new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US'), [lang])

  const load = useCallback(async () => {
    setLoadError('')
    try {
      const params = { dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }
      const [s, c, i] = await Promise.all([
        financeReportsService.summary(),
        financeReportsService.cashflow(params),
        financeReportsService.incomeStatement(params),
      ])
      setSummary(s)
      setCashflow(c)
      setIncome(i)
    } catch {
      setLoadError(r.loadError)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { load() }, [load])

  const net = summary ? summary.totalIn - summary.totalOut : 0

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{r.title}</h1>
          <p className={styles.pageSubtitle}>{r.subtitle}</p>
        </div>
      </div>

      {loadError && <Alert type="error" message={loadError} />}

      {/* Stat cards */}
      {summary && (
        <div className={styles.statGrid}>
          <div className={styles.statCard}><span className={styles.statLabel}>{r.statBalance}</span><span className={styles.statValue}>{fmt.format(summary.totalBalance)}</span></div>
          <div className={styles.statCard}><span className={styles.statLabel}>{r.statReceivable}</span><span className={styles.statValue}>{fmt.format(summary.receivable)}</span></div>
          <div className={styles.statCard}><span className={styles.statLabel}>{r.statPayable}</span><span className={styles.statValueWarn}>{fmt.format(summary.payable)}</span></div>
          <div className={styles.statCard}><span className={styles.statLabel}>{r.statNet}</span><span className={styles.statValue}>{fmt.format(net)}</span></div>
        </div>
      )}

      {/* Period filter */}
      <div className={styles.toolbar}>
        <div className={styles.field} style={{ maxWidth: 180 }}>
          <label className={styles.label}>{r.from}</label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className={styles.field} style={{ maxWidth: 180 }}>
          <label className={styles.label}>{r.to}</label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <Button onClick={load} className="w-auto px-4 self-end">{r.apply}</Button>
      </div>

      <div className={styles.reportGrid}>
        {/* Số dư tài khoản */}
        {summary && (
          <div className={styles.reportCard}>
            <span className={styles.sectionTitle}>{r.accountsTitle}</span>
            <div className={styles.detailItemsTable}>
              {summary.accounts.length === 0 ? (
                <div className={styles.payRow}><span className={styles.muted}>{r.noData}</span><span /><span /></div>
              ) : (
                summary.accounts.map((ac) => (
                  <div key={ac.id} className={styles.payRow}>
                    <span className="font-medium text-gray-800">{ac.name}</span>
                    <span className={styles.muted}>{t.finance.accountType[ac.type]}</span>
                    <span className={`${styles.right} font-semibold`}>{fmt.format(ac.currentBalance)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Kết quả kinh doanh */}
        {income && (
          <div className={styles.reportCard}>
            <span className={styles.sectionTitle}>{r.incomeTitle}</span>
            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}><span>{r.revenue}</span><span>{fmt.format(income.revenue)}</span></div>
              <div className={styles.summaryRow}><span>{r.purchases}</span><span>-{fmt.format(income.purchases)}</span></div>
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}><span>{r.grossProfit}</span><span>{fmt.format(income.grossProfit)}</span></div>
              <div className={styles.summaryRow}><span>{r.otherIncome}</span><span>+{fmt.format(income.otherIncome)}</span></div>
              <div className={styles.summaryRow}><span>{r.otherExpense}</span><span>-{fmt.format(income.otherExpense)}</span></div>
              <div className={`${styles.summaryRow} ${styles.summaryRemaining}`}><span>{r.netProfit}</span><span>{fmt.format(income.netProfit)}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Dòng tiền */}
      {cashflow && (
        <div className={styles.reportCard}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className={styles.sectionTitle}>{r.cashflowTitle}</span>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600 font-medium">{r.totalIn}: {fmt.format(cashflow.totalIn)}</span>
              <span className="text-red-500 font-medium">{r.totalOut}: {fmt.format(cashflow.totalOut)}</span>
              <span className="text-indigo-600 font-semibold">{r.netFlow}: {fmt.format(cashflow.net)}</span>
            </div>
          </div>
          <div className={styles.cashflowGrid}>
            <div>
              <span className={`${styles.detailLabel} block mb-1`}>{r.inflows}</span>
              <div className={styles.detailItemsTable}>
                {cashflow.inflows.length === 0 ? (
                  <div className={styles.payRow}><span className={styles.muted}>{r.noData}</span><span /></div>
                ) : cashflow.inflows.map((f, i) => (
                  <div key={i} className={styles.cashRow}><span className="text-gray-700">{t.finance.category[f.category]}</span><span className={`${styles.right} text-green-600 font-medium`}>{fmt.format(f.amount)}</span></div>
                ))}
              </div>
            </div>
            <div>
              <span className={`${styles.detailLabel} block mb-1`}>{r.outflows}</span>
              <div className={styles.detailItemsTable}>
                {cashflow.outflows.length === 0 ? (
                  <div className={styles.payRow}><span className={styles.muted}>{r.noData}</span><span /></div>
                ) : cashflow.outflows.map((f, i) => (
                  <div key={i} className={styles.cashRow}><span className="text-gray-700">{t.finance.category[f.category]}</span><span className={`${styles.right} text-red-500 font-medium`}>{fmt.format(f.amount)}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
