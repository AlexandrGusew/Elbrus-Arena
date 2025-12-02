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
  server: {
    host: '0.0.0.0', // Слушать на всех интерфейсах
    port: 5173,
    strictPort: true,
  },
  // Раскомментируй когда будешь деплоить через ngrok:
  // server: {
  //   host: '0.0.0.0',
  //   allowedHosts: ['.ngrok-free.dev', '.ngrok.io'],
  //   hmr: { clientPort: 443 }
  // }
})
