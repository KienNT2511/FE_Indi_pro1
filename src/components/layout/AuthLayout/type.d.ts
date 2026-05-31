import { type ReactNode } from 'react'

export interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
  footerText: string
  footerLinkLabel: string
  footerLinkTo: string
}
