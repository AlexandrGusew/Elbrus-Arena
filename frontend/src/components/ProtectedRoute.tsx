import { Navigate } from 'react-router-dom';
import { useLazyGetMyCharacterQuery } from '../store/api/characterApi';
import { useEffect, useState } from 'react';
import { getAccessToken } from '../store/api/baseApi';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [getMyCharacter, { isLoading, isError }] = useLazyGetMyCharacterQuery();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    const localStorageAuth = localStorage.getItem('isAuthenticated') === 'true';

    // Если нет токена в памяти и в localStorage - сразу редирект
    if (!token && !localStorageAuth) {
      setIsAuthenticated(false);
      return;
    }

    // Проверяем токен через API - запрашиваем данные персонажа
    // Если запрос успешен - пользователь авторизован
    getMyCharacter()
      .unwrap()
      .then(() => {
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
      })
      .catch((error: any) => {
        // Если 401 или 403 - не авторизован
        if (error?.status === 401 || error?.status === 403 || error?.status === 'FETCH_ERROR') {
          setIsAuthenticated(false);
          localStorage.setItem('isAuthenticated', 'false');
        } else {
          // Другие ошибки (например, персонаж не найден) - считаем авторизованным
          setIsAuthenticated(true);
          localStorage.setItem('isAuthenticated', 'true');
        }
      });
  }, [getMyCharacter]);

  // Показываем загрузку во время проверки
  if (isAuthenticated === null || isLoading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <div>Проверка авторизации...</div>
      </div>
    );
  }

  // Если не авторизован - редирект на главную
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
