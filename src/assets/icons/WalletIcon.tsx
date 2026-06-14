interface Props { size?: number }

export default function WalletIcon({ size = 18 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      <path d="M3 5v14" />
      <path d="M21 9h-6a2 2 0 0 0 0 6h6a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1Z" />
      <circle cx="16" cy="12" r="0.5" fill="currentColor" />
    </svg>
  )
}
