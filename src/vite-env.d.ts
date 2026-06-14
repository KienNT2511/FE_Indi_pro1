/// <reference types="vite/client" />

interface ImportMetaEnv {
  // URL gốc của API khi deploy tách origin (vd: https://my-api.onrender.com/api/v1).
  // Bỏ trống → dùng tương đối '/api/v1'.
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
