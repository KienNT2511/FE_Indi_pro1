import type { AuthUser } from '../../../services/auth/auth.types'

export interface AuthState {
  user: AuthUser | null
  loading: boolean
}
