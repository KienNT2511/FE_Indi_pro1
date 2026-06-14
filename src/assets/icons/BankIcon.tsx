interface Props { size?: number }

export default function BankIcon({ size = 18 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 10 9-6 9 6" />
      <path d="M4 10v9" />
      <path d="M20 10v9" />
      <path d="M8 10v9" />
      <path d="M16 10v9" />
      <path d="M2 21h20" />
    </svg>
  )
}
