import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Предупреждение если в production не задан API URL
if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
  console.warn('[baseApi] VITE_API_BASE_URL not set in production, using relative path /api')
}

// Хранилище access token в памяти (не в localStorage!)
let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

export const getAccessToken = () => accessToken

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include', // Важно! Отправляет httpOnly cookie с refresh token
  prepareHeaders: (headers) => {
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }
    headers.set('Content-Type', 'application/json')
    return headers
  },
})

// Обёртка для автоматического обновления токена при 401
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await baseQuery(args, api, extraOptions)

  // Если получили 401 (токен истёк), пробуем обновить через refresh token
  if (result.error && result.error.status === 401) {
    console.log('Access token expired, trying to refresh...')

    // Запрашиваем новый access token через refresh token (из cookie)
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions,
    )

    if (refreshResult.data) {
      // Сохраняем новый access token
      const { accessToken: newAccessToken } = refreshResult.data as { accessToken: string }
      setAccessToken(newAccessToken)

      console.log('Token refreshed successfully')

      // Повторяем оригинальный запрос с новым токеном
      result = await baseQuery(args, api, extraOptions)
    } else {
      // Если refresh token тоже невалидный - разлогиниваемся
      console.error('Refresh token invalid, logging out')
      setAccessToken(null)
    }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Character', 'Battle', 'Inventory', 'Item', 'Specialization'],
  endpoints: () => ({}),
})

export default baseApi