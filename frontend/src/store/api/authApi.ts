import { baseApi, setAccessToken } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ accessToken: string }, { telegramId: number }>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Сохраняем access token в памяти (не в localStorage!)
          setAccessToken(data.accessToken);
          // В localStorage храним только флаг авторизации для защищенных компонентов
          localStorage.setItem('isAuthenticated', 'true');
          console.log('Access token сохранён в памяти, флаг авторизации установлен');
        } catch (err) {
          console.error('Login failed:', err);
          localStorage.setItem('isAuthenticated', 'false');
        }
      },
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          // Очищаем access token из памяти
          setAccessToken(null);
          // Убираем флаг авторизации
          localStorage.setItem('isAuthenticated', 'false');
          console.log('Logged out, access token cleared');
        } catch (err) {
          console.error('Logout failed:', err);
        }
      },
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation } = authApi;
