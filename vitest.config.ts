import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Cấu hình riêng cho test (không nạp tailwind plugin để tránh xử lý CSS khi test).
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
