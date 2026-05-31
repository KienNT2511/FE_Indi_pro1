import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { authService } from '../../../services/auth/auth.service'
import type { AuthUser } from '../../../services/auth/auth.types'
import type { AuthState } from './type'

// Khởi tạo auth khi app load — validate token có sẵn trong localStorage
export const initAuth = createAsyncThunk<AuthUser | null>('auth/init', async () => {
  const token = localStorage.getItem('accessToken')
  if (!token) return null
  try {
    return await authService.me()
  } catch {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    return null
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: true } as AuthState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initAuth.fulfilled, (state, action) => {
        state.user = action.payload
        state.loading = false
      })
      .addCase(initAuth.rejected, (state) => {
        state.user = null
        state.loading = false
      })
  },
})

export const { setUser } = authSlice.actions
export default authSlice.reducer
