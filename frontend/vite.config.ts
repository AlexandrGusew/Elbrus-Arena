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
  // Убрал настройки ngrok для локальной разработки
  // Раскомментируй когда будешь деплоить через ngrok:
  // server: {
  //   allowedHosts: ['.ngrok-free.dev', '.ngrok.io'],
  //   hmr: { clientPort: 443 }
  // }
})
