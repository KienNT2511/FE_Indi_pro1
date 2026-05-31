interface Props { pass: boolean; size?: number }

export default function StrengthCheckIcon({ pass, size = 10 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {pass
        ? <polyline points="20 6 9 17 4 12" />
        : <line x1="18" y1="6" x2="6" y2="18" />
      }
    </svg>
  )
}
