import axios from 'axios'

// Mặc định gọi tương đối '/api/v1' (dùng khi frontend & backend cùng origin,
// hoặc host frontend có rewrite /api → backend). Khi deploy tách origin,
// đặt VITE_API_URL=https://<backend>/api/v1 lúc build.
const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

const api = axios.create({
  baseURL: API_BASE,
})

// ── JWT helpers ──────────────────────────────────────────────────
const getTokenExp = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

const isExpiringSoon = (token: string, bufferSeconds = 60): boolean => {
  const exp = getTokenExp(token)
  if (!exp) return true
  return Date.now() / 1000 >= exp - bufferSeconds
}

const normalizeTokens = (data: Record<string, string>) => ({
  accessToken: data.accessToken ?? data.access_token,
  refreshToken: data.refreshToken ?? data.refresh_token,
})

// ── Refresh queue (tránh gọi refresh đồng thời) ──────────────────
let refreshPromise: Promise<string> | null = null

const refreshAccessToken = async (): Promise<string> => {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) throw new Error('No refresh token')

    const res = await axios.post(
      `${API_BASE}/auth/refresh`,
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } },
    )

    const tokens = normalizeTokens(res.data)
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    return tokens.accessToken
  })().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

const redirectToLogin = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  window.location.href = '/login'
}

// ── Request interceptor: chủ động refresh trước khi gửi ──────────
api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('accessToken')

  if (token && isExpiringSoon(token)) {
    try {
      token = await refreshAccessToken()
    } catch {
      redirectToLogin()
      return Promise.reject(new Error('Session expired'))
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// ── Response interceptor: fallback nếu vẫn 401 sau refresh ───────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      redirectToLogin()
    }
    return Promise.reject(error)
  },
)

export default api
