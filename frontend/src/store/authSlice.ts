/**
 * Redux Slice для управления состоянием авторизации
 *
 * Содержит:
 * - Состояние авторизации (isAuthenticated, user, loading, error)
 * - Actions для управления состоянием
 * - Async thunks для авторизации
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, User } from '../types/auth'
import { authService } from '../services/auth.service'

/**
 * Начальное состояние
 */
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null
}

/**
 * ASYNC THUNK: Авторизация через Telegram
 *
 * Принимает initData, отправляет на backend, сохраняет токен
 *
 * @example
 * ```ts
 * dispatch(loginWithTelegram(initData))
 * ```
 */
export const loginWithTelegram = createAsyncThunk(
  'auth/loginWithTelegram',
  async (initData: string, { rejectWithValue }) => {
    try {
      const response = await authService.loginWithTelegram(initData)
      return response.user // Возвращаем данные пользователя
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка авторизации')
    }
  }
)

/**
 * ASYNC THUNK: Проверка авторизации
 *
 * Проверяет валидность токена на backend
 *
 * @example
 * ```ts
 * dispatch(checkAuth())
 * ```
 */
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.checkAuth()

      if (!user) {
        return rejectWithValue('Не авторизован')
      }

      return user
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка проверки авторизации')
    }
  }
)

/**
 * Auth Slice
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Выход из системы
     *
     * @example
     * ```ts
     * dispatch(logout())
     * ```
     */
    logout: (state) => {
      authService.logout()
      state.isAuthenticated = false
      state.user = null
      state.error = null
      console.log('👋 Пользователь вышел из системы')
    },

    /**
     * Очистка ошибки
     *
     * @example
     * ```ts
     * dispatch(clearError())
     * ```
     */
    clearError: (state) => {
      state.error = null
    },

    /**
     * Установка данных пользователя вручную
     * (для dev mode или восстановления из localStorage)
     *
     * @example
     * ```ts
     * dispatch(setUser(userData))
     * ```
     */
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // ==========================================
    // loginWithTelegram
    // ==========================================
    builder.addCase(loginWithTelegram.pending, (state) => {
      state.loading = true
      state.error = null
      console.log('⏳ Авторизация через Telegram...')
    })

    builder.addCase(loginWithTelegram.fulfilled, (state, action) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload
      state.error = null
      console.log('✅ Авторизация успешна:', action.payload.firstName)
    })

    builder.addCase(loginWithTelegram.rejected, (state, action) => {
      state.loading = false
      state.isAuthenticated = false
      state.user = null
      state.error = action.payload as string
      console.error('❌ Ошибка авторизации:', action.payload)
    })

    // ==========================================
    // checkAuth
    // ==========================================
    builder.addCase(checkAuth.pending, (state) => {
      state.loading = true
      console.log('🔍 Проверка авторизации...')
    })

    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload
      state.error = null
      console.log('✅ Авторизация подтверждена:', action.payload.firstName)
    })

    builder.addCase(checkAuth.rejected, (state, action) => {
      state.loading = false
      state.isAuthenticated = false
      state.user = null
      state.error = action.payload as string
      console.log('🔓 Не авторизован')
    })
  }
})

/**
 * Экспортируем actions
 */
export const { logout, clearError, setUser } = authSlice.actions

/**
 * Экспортируем reducer
 */
export default authSlice.reducer
