interface Props { size?: number }

export default function TransferIcon({ size = 18 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m17 3 4 4-4 4" />
      <path d="M21 7H3" />
      <path d="m7 21-4-4 4-4" />
      <path d="M3 17h18" />
    </svg>
  )
}
