interface Props { size?: number }

export default function FactoryIcon({ size = 18 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 4V8l-7 4V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M6 18h2" />
      <path d="M12 18h2" />
      <path d="M18 18h2" />
    </svg>
  )
}
