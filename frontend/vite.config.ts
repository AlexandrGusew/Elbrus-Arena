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
  server: {
    // Разрешаем доступ с ngrok доменов для тестирования в Telegram
    allowedHosts: [
      '.ngrok-free.dev',  // Для всех ngrok-free.dev доменов
      '.ngrok.io',        // Для всех ngrok.io доменов (если будете использовать платный ngrok)
    ],
    // Настройки для корректной работы через ngrok
    hmr: {
      clientPort: 443     // ngrok использует HTTPS (порт 443)
    }
  }
})
