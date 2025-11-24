/**
 * Redux Store Configuration
 *
 * Центральное хранилище состояния приложения
 */

import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'

/**
 * Создаем Redux Store
 */
export const store = configureStore({
  reducer: {
    auth: authReducer
    // Здесь будут добавлены другие reducers:
    // character: characterReducer,
    // battle: battleReducer,
    // и т.д.
  },
  // Middleware для логирования в dev mode
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем проверку для определенных actions
        // (если будут использоваться Date, функции, и т.д.)
        ignoredActions: [],
        ignoredPaths: []
      }
    }),
  devTools: import.meta.env.DEV // Redux DevTools только в dev mode
})

/**
 * Типы для TypeScript
 */
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

/**
 * Экспортируем store
 *
 * Использование:
 *
 * // В main.tsx оборачиваем приложение в Provider:
 * import { Provider } from 'react-redux'
 * import { store } from './store'
 *
 * <Provider store={store}>
 *   <App />
 * </Provider>
 *
 * // В компонентах используем хуки:
 * import { useSelector, useDispatch } from 'react-redux'
 * import type { RootState, AppDispatch } from './store'
 *
 * const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
 * const dispatch = useDispatch<AppDispatch>()
 */
export default store
