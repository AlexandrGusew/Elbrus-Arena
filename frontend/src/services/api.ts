/**
 * Централизованный HTTP клиент на базе Axios
 *
 * Возможности:
 * - Автоматическое добавление базового URL
 * - Автоматическое добавление JWT токена к запросам
 * - Обработка ошибок
 * - Логирование запросов в dev mode
 */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

/**
 * Базовый URL для API
 * Берется из переменной окружения VITE_API_BASE_URL
 * По умолчанию: http://localhost:3000/api
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

/**
 * Создаем настроенный экземпляр Axios
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 секунд (для медленных соединений)
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * REQUEST INTERCEPTOR
 * Срабатывает ПЕРЕД каждым запросом
 *
 * Что делает:
 * 1. Достает JWT токен из localStorage
 * 2. Добавляет токен в заголовок Authorization
 * 3. Логирует запрос в dev mode
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Получаем токен из localStorage
    const token = localStorage.getItem('auth_token')

    // Если токен есть - добавляем в заголовок
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Логируем в dev mode
    if (import.meta.env.DEV) {
      console.log('🌐 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasToken: !!token,
        data: config.data
      })
    }

    return config
  },
  (error: AxiosError) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  }
)

/**
 * RESPONSE INTERCEPTOR
 * Срабатывает ПОСЛЕ получения ответа
 *
 * Что делает:
 * 1. Логирует успешный ответ в dev mode
 * 2. Обрабатывает ошибки (401, 403, 500, и т.д.)
 * 3. Автоматически разлогинивает при истекшем токене
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Логируем успешный ответ в dev mode
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      })
    }

    return response
  },
  (error: AxiosError) => {
    // Обработка ошибок
    if (error.response) {
      // Сервер ответил с ошибкой (4xx, 5xx)
      const status = error.response.status

      console.error('❌ API Error:', {
        status,
        url: error.config?.url,
        message: error.response.data
      })

      // 401 Unauthorized - токен истек или невалиден
      if (status === 401) {
        console.warn('⚠️ Token expired or invalid. Logging out...')

        // Удаляем токен
        localStorage.removeItem('auth_token')

        // Перенаправляем на страницу авторизации (если не на ней)
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth'
        }
      }

      // 403 Forbidden - нет прав доступа
      if (status === 403) {
        console.error('🚫 Access denied')
      }

      // 500 Internal Server Error - ошибка сервера
      if (status === 500) {
        console.error('💥 Server error')
      }
    } else if (error.request) {
      // Запрос отправлен, но ответ не получен
      console.error('📡 No response from server:', error.request)
    } else {
      // Ошибка при настройке запроса
      console.error('⚙️ Request setup error:', error.message)
    }

    return Promise.reject(error)
  }
)

/**
 * Экспортируем настроенный экземпляр Axios
 *
 * Использование:
 *
 * import { api } from './services/api'
 *
 * // GET запрос
 * const response = await api.get('/characters/me')
 *
 * // POST запрос
 * const response = await api.post('/auth/telegram', { initData })
 *
 * // PUT запрос
 * const response = await api.put('/characters/123', { name: 'New Name' })
 *
 * // DELETE запрос
 * const response = await api.delete('/characters/123')
 */
export default api
