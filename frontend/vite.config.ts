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
    fs: {
      // 啟用嚴格模式，只允許訪問特定目錄
      strict: true,
      // 允許訪問專案目錄和 node_modules（用於 Tesseract worker）
      allow: [
        // 工作目錄
        '.',
        // 父目錄（用於 monorepo 設定）
        '..',
        // node_modules 用於 Tesseract worker
        '/node_modules',
        '/Users/macmini/Project/taipower-tou-web/node_modules',
      ],
    },
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

  // 全域定義，讓 Tesseract 可以正確載入 worker
  define: {
    // Tesseract.js 在生產環境需要知道正確的 base 路徑
    'import.meta.env.BASE_URL': JSON.stringify(process.env.VITE_BASE_URL || '/taipower-tou-web/'),
  },

  // Vitest 設定 (test property is injected by vitest)
  // @ts-expect-error - vitest adds 'test' property to UserConfig
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // 排除 E2E 測試，避免 Vitest 執行 Playwright 規格
    exclude: [
      'node_modules',
      'dist',
      'tests/e2e/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
})
