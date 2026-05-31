interface Props { size?: number; color?: string }

export default function CheckCircleIcon({ size = 12, color = '#6366f1' }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
