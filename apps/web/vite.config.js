import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@data': path.resolve(__dirname, './src/data'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@context': path.resolve(__dirname, './src/context'),
      '@styles': path.resolve(__dirname, './src/styles'),
    }
  },
  build: {
    chunkSizeWarningLimit: 1200,
  },
})
