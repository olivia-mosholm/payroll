import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/payroll/',
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  css: {
    transformer: 'postcss',
  },
  build: {
    cssMinify: false,
  },
})
