import { useLanguage } from '../../../context/LanguageContext'
import type { Lang } from '../../../i18n'
import styles from './style.module.css'
import type { LanguageSwitcherProps } from './type'

const FlagVN = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-sm overflow-hidden shrink-0">
    <rect width="20" height="14" fill="#DA251D" />
    <polygon
      points="10,2.8 11.18,6.44 15,6.44 12.1,8.56 13.28,12.2 10,10.08 6.72,12.2 7.9,8.56 5,6.44 8.82,6.44"
      fill="#FFFF00"
    />
  </svg>
)

const FlagGB = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-sm overflow-hidden shrink-0">
    <rect width="20" height="14" fill="#012169" />
    <line x1="0" y1="0"  x2="20" y2="14" stroke="white" strokeWidth="3" />
    <line x1="20" y1="0" x2="0"  y2="14" stroke="white" strokeWidth="3" />
    <line x1="0" y1="0"  x2="20" y2="14" stroke="#C8102E" strokeWidth="1.6" />
    <line x1="20" y1="0" x2="0"  y2="14" stroke="#C8102E" strokeWidth="1.6" />
    <rect x="0"   y="5.2" width="20" height="3.6" fill="white" />
    <rect x="8.2" y="0"   width="3.6" height="14" fill="white" />
    <rect x="0"   y="5.8" width="20" height="2.4" fill="#C8102E" />
    <rect x="8.8" y="0"   width="2.4" height="14" fill="#C8102E" />
  </svg>
)

const OPTIONS: { lang: Lang; label: string; Flag: () => JSX.Element }[] = [
  { lang: 'vi', label: 'VI', Flag: FlagVN },
  { lang: 'en', label: 'EN', Flag: FlagGB },
]

export default function LanguageSwitcher({ variant = 'light' }: LanguageSwitcherProps) {
  const { lang, setLang } = useLanguage()
  const isDark = variant === 'dark'
  const isEN   = lang === 'en'

  return (
    <div
      className={`${styles.track} ${isDark ? styles.trackDark : styles.trackLight}`}
      style={{ width: 128 }}
    >
      <div
        className={`${styles.thumb} ${isDark ? styles.thumbDark : styles.thumbLight}`}
        style={{
          width: 'calc(50% - 4px)',
          left: 4,
          transform: isEN ? 'translateX(calc(100% + 0px))' : 'translateX(0)',
        }}
      />

      {OPTIONS.map(({ lang: l, label, Flag }) => {
        const isActive = lang === l
        const textClass = isDark
          ? (isActive ? styles.optionActiveDark  : styles.optionIdleDark)
          : (isActive ? styles.optionActiveLight : styles.optionIdleLight)

        return (
          <button key={l} onClick={() => setLang(l)} className={`${styles.option} ${textClass}`}>
            <Flag />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
