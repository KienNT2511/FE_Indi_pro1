import { authService } from '../services/auth/auth.service'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setUser } from '../store/slices/auth/authSlice'

export function useAuth() {
  const dispatch = useAppDispatch()
  const { user, loading } = useAppSelector(state => state.auth)

  const login = async (email: string, password: string) => {
    const tokens = await authService.login({ email, password })
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    const profile = await authService.me()
    dispatch(setUser(profile))
  }

  const register = async (email: string, password: string, name?: string) => {
    await authService.register({ email, password, name })
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      dispatch(setUser(null))
    }
  }

  return { user, loading, login, register, logout }
}
