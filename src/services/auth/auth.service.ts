import api from '../../api/axios'
import type { AuthUser, ChangePasswordDto, LoginDto, RegisterDto, TokenPair } from './auth.types'
import type { User } from '../users/users.types'

const normalizeTokens = (data: Record<string, string>): TokenPair => ({
  accessToken: data.accessToken ?? data.access_token,
  refreshToken: data.refreshToken ?? data.refresh_token,
})

export const authService = {
  // POST /auth/register — không cần auth
  register: async (dto: RegisterDto): Promise<User> => {
    const res = await api.post('/auth/register', dto)
    return res.data
  },

  // POST /auth/login — LocalAuthGuard (passport-local)
  login: async (dto: LoginDto): Promise<TokenPair> => {
    const res = await api.post('/auth/login', dto)
    return normalizeTokens(res.data)
  },

  // POST /auth/refresh — JwtRefreshGuard (Bearer refreshToken)
  refresh: async (refreshToken: string): Promise<TokenPair> => {
    const res = await api.post(
      '/auth/refresh',
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } },
    )
    return normalizeTokens(res.data)
  },

  // POST /auth/logout — JwtAuthGuard (Bearer accessToken)
  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  // GET /auth/me — JwtAuthGuard, trả về JWT payload (sub, email)
  me: async (): Promise<AuthUser> => {
    const res = await api.get('/auth/me')
    return res.data
  },

  // PATCH /auth/change-password — JwtAuthGuard
  changePassword: async (dto: ChangePasswordDto): Promise<void> => {
    await api.patch('/auth/change-password', dto)
  },
}
