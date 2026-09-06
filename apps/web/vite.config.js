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
      '@nuracare/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      'decimal.js-light': path.resolve(__dirname, '../../node_modules/decimal.js-light/decimal.js'),
      'iceberg-js': path.resolve(__dirname, '../../node_modules/iceberg-js/dist/index.cjs'),
      'tslib': path.resolve(__dirname, '../../node_modules/tslib/tslib.es6.js'),
      'reselect': path.resolve(__dirname, '../../node_modules/reselect/dist/reselect.legacy-esm.js'),
      'redux': path.resolve(__dirname, '../../node_modules/redux/dist/redux.legacy-esm.js'),
    }
  },
  build: {
    chunkSizeWarningLimit: 1200,
  },
})
