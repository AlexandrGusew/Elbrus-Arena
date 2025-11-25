/**
 * Страница авторизации через Telegram
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/useRedux'
import { loginWithTelegram } from '../store/authSlice'
import { useTelegramWebApp } from '../hooks/useTelegramWebApp'

export default function Auth() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isAuthenticated, loading, error } = useAppSelector(
    (state) => state.auth
  )
  const { initData, isReady, isDevMode } = useTelegramWebApp()

  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Уже авторизован - редирект на /dashboard')
      navigate('/dashboard', { replace: true })
      return
    }

    if (!isReady) {
      console.log('⏳ Ожидание инициализации Telegram WebApp...')
      return
    }

    if (!initData) {
      console.error('❌ initData отсутствует')
      return
    }

    console.log('🔐 Начинаем авторизацию через Telegram...')
    dispatch(loginWithTelegram(initData))
  }, [isAuthenticated, isReady, initData, dispatch, navigate])

  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Авторизация успешна')
      navigate('/character-creation', { replace: true })
    }
  }, [isAuthenticated, navigate])

  return (
    <div>
      {isDevMode && <div>⚠️ DEV MODE</div>}

      <h1>🎮 Elbrus Arena</h1>

      {!isReady && (
        <div>
          <p>Инициализация Telegram WebApp...</p>
        </div>
      )}

      {isReady && loading && (
        <div>
          <p>Авторизация через Telegram...</p>
        </div>
      )}

      {error && (
        <div>
          <h3>❌ Ошибка авторизации</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Попробовать снова
          </button>
        </div>
      )}

      {isReady && !initData && !loading && (
        <div>
          <h3>⚠️ Невозможно авторизоваться</h3>
          <p>Приложение должно запускаться через Telegram Bot.</p>
          <p>Или включите DEV MODE в .env файле.</p>
        </div>
      )}
    </div>
  )
}
