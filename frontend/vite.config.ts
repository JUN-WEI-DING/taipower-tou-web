import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // GitHub Pages 部署設定
  base: process.env.VITE_BASE_URL || '/taipower-tou-web/',

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // 移除 proxy，因為是純前端
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // 分割套件以提升載入速度
          'tesseract': ['tesseract.js'],
          'recharts': ['recharts'],
          'vendor': ['react', 'react-dom'],
        },
      },
    },
    // 設定 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
  },

  optimizeDeps: {
    include: ['tesseract.js', 'recharts'],
  },

  // Vitest 設定 (使用 as any 避免 TypeScript 型別錯誤)
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
} as any)
