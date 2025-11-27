import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  build: {
    // Явно указываем выходную директорию
    outDir: 'dist',
    // Увеличиваем лимит размера чанка
    chunkSizeWarningLimit: 1000,
    // Оптимизация для больших файлов
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          socket: ['socket.io-client'],
        },
      },
    },
    minify: 'esbuild',
    sourcemap: false,
  },
  // Убрал настройки ngrok для локальной разработки
  // Раскомментируй когда будешь деплоить через ngrok:
  // server: {
  //   allowedHosts: ['.ngrok-free.dev', '.ngrok.io'],
  //   hmr: { clientPort: 443 }
  // }
})
