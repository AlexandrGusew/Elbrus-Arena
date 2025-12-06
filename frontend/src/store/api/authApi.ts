import { baseApi, setAccessToken } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // TELEGRAM АВТОРИЗАЦИЯ через WebApp
    loginWithTelegram: builder.mutation<{ accessToken: string }, { initData: string }>({
      query: (body) => ({
        url: '/auth/telegram',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          setAccessToken(data.accessToken);
          // Очищаем characterId при входе нового пользователя
          localStorage.removeItem('characterId');
          // Очищаем кэш предыдущего пользователя
          dispatch(baseApi.util.resetApiState());
          localStorage.setItem('isAuthenticated', 'true');
          console.log('Telegram авторизация успешна');
        } catch (err) {
          console.error('Telegram login failed:', err);
          localStorage.setItem('isAuthenticated', 'false');
        }
      },
    }),

    // РЕГИСТРАЦИЯ - простая с логином и паролем
    register: builder.mutation<{ accessToken: string }, { username: string; password: string }>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          setAccessToken(data.accessToken);
          // Очищаем characterId при регистрации нового пользователя
          localStorage.removeItem('characterId');
          // Очищаем кэш предыдущего пользователя
          dispatch(baseApi.util.resetApiState());
          localStorage.setItem('isAuthenticated', 'true');
          console.log('✅ Регистрация успешна');
        } catch (err) {
          console.error('❌ Registration failed:', err);
          localStorage.setItem('isAuthenticated', 'false');
        }
      },
    }),

    // ВХОД - классическая авторизация
    login: builder.mutation<{ accessToken: string }, { username: string; password: string }>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          setAccessToken(data.accessToken);
          // Очищаем characterId при входе
          localStorage.removeItem('characterId');
          // Очищаем кэш предыдущего пользователя
          dispatch(baseApi.util.resetApiState());
          localStorage.setItem('isAuthenticated', 'true');
          console.log('✅ Вход успешен');
        } catch (err) {
          console.error('❌ Login failed:', err);
          localStorage.setItem('isAuthenticated', 'false');
        }
      },
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          setAccessToken(null);
          // Очищаем characterId из localStorage
          localStorage.removeItem('characterId');
          // Очищаем весь кэш RTK Query
          dispatch(baseApi.util.resetApiState());
          localStorage.setItem('isAuthenticated', 'false');
          console.log('Logged out, access token and cache cleared');
        } catch (err) {
          console.error('Logout failed:', err);
        }
      },
    }),

    // ИНИЦИАЦИЯ АВТОРИЗАЦИИ ЧЕРЕЗ TELEGRAM
    initiateTelegramAuth: builder.mutation<{ success: boolean; message: string }, { telegramUsername: string }>({
      query: (body) => ({
        url: '/auth/telegram/initiate',
        method: 'POST',
        body,
      }),
    }),

    // АВТОРИЗАЦИЯ ЧЕРЕЗ КОД ИЗ TELEGRAM
    verifyTelegramCode: builder.mutation<{ accessToken: string }, { telegramUsername: string; code: string }>({
      query: (body) => ({
        url: '/auth/telegram/verify-code',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          setAccessToken(data.accessToken);
          // Очищаем characterId при входе нового пользователя
          localStorage.removeItem('characterId');
          // Очищаем кэш предыдущего пользователя
          dispatch(baseApi.util.resetApiState());
          localStorage.setItem('isAuthenticated', 'true');
          console.log('Telegram авторизация через код успешна');
        } catch (err) {
          console.error('Telegram code verification failed:', err);
          localStorage.setItem('isAuthenticated', 'false');
        }
      },
    }),

    // ПРОВЕРКА АВТОРИЗАЦИИ
    checkAuth: builder.query<{ authenticated: boolean }, void>({
      query: () => ({
        url: '/character/me',
        method: 'GET',
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          localStorage.setItem('isAuthenticated', 'true');
        } catch (err: any) {
          if (err.error?.status === 401 || err.error?.status === 403) {
            setAccessToken(null);
            localStorage.setItem('isAuthenticated', 'false');
          }
        }
      },
    }),
  }),
});

export const {
  useLoginWithTelegramMutation,
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useInitiateTelegramAuthMutation,
  useVerifyTelegramCodeMutation,
  useCheckAuthQuery,
  useLazyCheckAuthQuery,
} = authApi;
