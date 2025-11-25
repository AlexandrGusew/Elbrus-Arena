/**
 * Компонент защищенного роута
 */

import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../hooks/useRedux'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth)

  if (loading) {
    return (
      <div>
        <h2>Загрузка...</h2>
        <p>Проверка авторизации</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('🚫 Доступ запрещен - редирект на /auth')
    return <Navigate to="/auth" replace />
  }

  console.log('✅ Доступ разрешен - пользователь авторизован')
  return <>{children}</>
}
