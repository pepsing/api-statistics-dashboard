import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? '/api-statistics-dashboard/' : '/',
  server: {
    proxy: {
      '/admin': {
        target: 'https://cc.digix.icu',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
