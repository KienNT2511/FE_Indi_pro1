import vi from './translations/vi'
import en from './translations/en'

export type Lang = 'vi' | 'en'

export interface Translations {
  common: { appName: string; appDescription: string; save: string; cancel: string }
  auth: {
    login: {
      title: string; subtitle: string; email: string; password: string
      forgotPassword: string; submit: string; footerText: string; footerLink: string; error: string
    }
    register: {
      title: string; subtitle: string; name: string; nameOptional: string; namePlaceholder: string
      email: string; password: string; passwordPlaceholder: string
      confirmPassword: string; confirmPlaceholder: string
      submit: string; footerText: string; footerLink: string; mismatch: string; error: string
    }
  }
  nav: {
    dashboard: string; changePassword: string; logout: string
    logoutConfirmTitle: string; logoutConfirmDesc: string; logoutConfirm: string; logoutCancel: string
  }
  dashboard: { title: string; subtitle: string; accountInfo: string; id: string; email: string }
  changePassword: {
    title: string; subtitle: string; sectionTitle: string
    currentPassword: string; currentPlaceholder: string
    newPassword: string; newPlaceholder: string
    confirmPassword: string; confirmPlaceholder: string
    submit: string; success: string; error: string; mismatch: string
    tipsTitle: string; tips: readonly string[]
  }
  strength: { weak: string; medium: string; fair: string; strong: string; minLength: string; uppercase: string; number: string }
}

export const translations: Record<Lang, Translations> = {
  vi: vi as Translations,
  en: en as Translations,
}
