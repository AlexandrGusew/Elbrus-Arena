import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useRegisterMutation,
  useLoginMutation,
  useInitiateTelegramAuthMutation,
  useVerifyTelegramCodeMutation,
} from '../store/api/authApi';
import { useLazyGetMyCharacterQuery } from '../store/api/characterApi';
import { setAccessToken } from '../store/api/baseApi';
import { getAssetUrl } from '../utils/assetUrl';

type AuthMode = 'username' | 'telegram';

// Telegram бот
const TELEGRAM_BOT_USERNAME = 'autharenanightfall_bot';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('username');
  const [isRegister, setIsRegister] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(() => {
    const savedMusicState = localStorage.getItem('musicPlaying');
    return savedMusicState !== null ? savedMusicState === 'true' : true;
  });
  const audioRef = useRef<HTMLAudioElement>(null);

  // Username/password
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Telegram
  const [telegramUsername, setTelegramUsername] = useState('');
  const [code, setCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  const [error, setError] = useState('');

  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [initiateTelegramAuth] = useInitiateTelegramAuthMutation();
  const [verifyTelegramCode, { isLoading: isVerifying }] = useVerifyTelegramCodeMutation();
  const [getMyCharacter] = useLazyGetMyCharacterQuery();

  // После успешной авторизации
  const handleAuthSuccess = async () => {
    try {
      // Проверяем, есть ли у пользователя персонаж
      const { data: character } = await getMyCharacter();

      if (character) {
        // Персонаж найден - сохраняем ID и переходим на Dashboard
        localStorage.setItem('characterId', character.id.toString());
        navigate('/dashboard');
      } else {
        // Персонажа нет - переходим на создание персонажа
        navigate('/create-character');
      }
    } catch (error) {
      console.error('Error checking character:', error);
      // В случае ошибки переходим на создание персонажа
      navigate('/create-character');
    }
  };

  // РЕГИСТРАЦИЯ
  const handleRegister = async () => {
    try {
      setError('');
      if (!username || username.length < 3) {
        setError('Логин должен быть минимум 3 символа');
        return;
      }
      if (!password || password.length < 6) {
        setError('Пароль должен быть минимум 6 символов');
        return;
      }

      const result = await register({ username, password }).unwrap();
      // Явно сохраняем токен перед проверкой персонажа
      setAccessToken(result.accessToken);
      localStorage.setItem('isAuthenticated', 'true');

      // Небольшая задержка, чтобы токен точно применился
      await new Promise(resolve => setTimeout(resolve, 100));

      await handleAuthSuccess();
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.data?.message || 'Ошибка регистрации');
    }
  };

  // ВХОД
  const handleLogin = async () => {
    try {
      setError('');
      if (!username) {
        setError('Введите логин');
        return;
      }
      if (!password) {
        setError('Введите пароль');
        return;
      }

      const result = await login({ username, password }).unwrap();
      // Явно сохраняем токен перед проверкой персонажа
      setAccessToken(result.accessToken);
      localStorage.setItem('isAuthenticated', 'true');

      // Небольшая задержка, чтобы токен точно применился
      await new Promise(resolve => setTimeout(resolve, 100));

      await handleAuthSuccess();
    } catch (err: any) {
      console.error('Login error:', err);

      // Детальная обработка ошибок
      let errorMessage = 'Неверный логин или пароль';

      if (err.status === 500) {
        errorMessage = 'Ошибка сервера. Проверьте логи бэкенда или обратитесь к администратору';
        console.error('Server error details:', err.data || err);
      } else if (err.status === 401) {
        errorMessage = err.data?.message || 'Неверный логин или пароль';
      } else if (err.status === 404) {
        errorMessage = 'API endpoint не найден. Проверьте конфигурацию сервера';
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    }
  };

  // ОТКРЫТЬ TELEGRAM БОТА
  const handleOpenTelegramBot = async () => {
    try {
      setError('');

      if (!telegramUsername || telegramUsername.length < 2) {
        setError('Введите ваш Telegram логин (например: username или @username)');
        return;
      }

      // Инициируем попытку авторизации на бэке
      await initiateTelegramAuth({ telegramUsername }).unwrap();

      // Создаем невидимую ссылку для попытки открыть Telegram приложение
      const link = document.createElement('a');
      link.href = `tg://resolve?domain=${TELEGRAM_BOT_USERNAME}`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Показываем поле для ввода кода
      setShowCodeInput(true);

      // Показываем информационное сообщение пользователю
      alert(
        `Откройте Telegram и напишите /start боту @${TELEGRAM_BOT_USERNAME}\n\n` +
        `Вы получите код для входа.`
      );
    } catch (err: any) {
      console.error('Initiate error:', err);
      setError(err.data?.message || 'Ошибка инициации авторизации');
    }
  };

  // ПРОВЕРИТЬ КОД И ВОЙТИ
  const handleVerifyCode = async () => {
    try {
      setError('');

      if (!code) {
        setError('Введите код');
        return;
      }

      const result = await verifyTelegramCode({ telegramUsername, code }).unwrap();
      // Явно сохраняем токен перед проверкой персонажа
      setAccessToken(result.accessToken);
      localStorage.setItem('isAuthenticated', 'true');

      // Небольшая задержка, чтобы токен точно применился
      await new Promise(resolve => setTimeout(resolve, 100));

      await handleAuthSuccess();
    } catch (err: any) {
      console.error('Verify code error:', err);
      setError(err.data?.message || 'Неверный или истекший код');
    }
  };

  // Управление музыкой
  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        // Пытаемся воспроизвести только если пользователь уже взаимодействовал со страницей
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            // Автовоспроизведение заблокировано - ждем первого взаимодействия
            console.log('Autoplay blocked, waiting for user interaction');
            // Отключаем флаг музыки, чтобы не было путаницы
            setIsMusicPlaying(false);
            localStorage.setItem('musicPlaying', 'false');
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying]);

  const toggleMusic = () => {
    const newState = !isMusicPlaying;
    setIsMusicPlaying(newState);
    localStorage.setItem('musicPlaying', String(newState));
  };

  const containerStyle: React.CSSProperties = {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  const errorStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(220, 38, 38, 0.9)',
    color: '#fff',
    padding: '15px 30px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    zIndex: 10,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  };

  const modeSwitchStyle: React.CSSProperties = {
    position: 'absolute',
    top: '30px',
    right: '30px',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'flex-end',
  };

  const musicButtonStyle: React.CSSProperties = {
    width: '400px',
    height: '160px',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    padding: 0,
    transition: 'all 0.3s ease',
  };

  const modeButtonStyle = (isActive: boolean): React.CSSProperties => ({
    width: '360px',
    height: '140px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
    transition: 'all 0.3s ease',
    filter: isActive ? 'brightness(1.2) drop-shadow(0 0 15px rgba(255, 215, 0, 0.6))' : 'brightness(0.8)',
  });

  return (
    <div style={containerStyle}>
      {/* Видео фон */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 1,
        }}
      >
        <source src={getAssetUrl('createCharacter/animatedBackground.mp4')} type="video/mp4" />
      </video>

      {/* Фоновая музыка */}
      <audio ref={audioRef} loop>
        <source src={getAssetUrl('createCharacter/backgroundIntro.mp3')} type="audio/mpeg" />
      </audio>

      {/* Кнопки управления справа */}
      <div style={modeSwitchStyle}>
        {/* Кнопка музыки */}
        <button
          onClick={toggleMusic}
          style={musicButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 15px rgba(255, 215, 0, 0.6))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.filter = isMusicPlaying ? 'brightness(1)' : 'brightness(0.7)';
          }}
        >
          <img
            src={getAssetUrl('createCharacter/music.png')}
            alt="Music"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: isMusicPlaying ? 'brightness(1)' : 'brightness(0.7)',
            }}
          />
        </button>

        {/* Кнопка переключения на логин/пароль */}
        {/* <button
          onClick={() => {
            setMode('username');
            setError('');
            setShowCodeInput(false);
          }}
          style={modeButtonStyle(mode === 'username')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <img
            src={getAssetUrl('createCharacter/create.png')}
            alt="Username/Password"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </button> */}

        {/* Кнопка переключения на Telegram */}
        {/* <button
          onClick={() => {
            setMode('telegram');
            setError('');
            setShowCodeInput(false);
            setCode('');
          }}
          style={modeButtonStyle(mode === 'telegram')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <img
            src={getAssetUrl('createCharacter/login.png')}
            alt="Telegram"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </button> */}
      </div>

      {/* Ошибка */}
      {error && <div style={errorStyle}>{error}</div>}

      {/* Модальное окно авторизации */}
      <div style={{
        position: 'relative',
        width: '900px',
        height: '600px',
        zIndex: 2,
      }}>
        {/* Фоновое изображение модального окна */}
        <img
          src={getAssetUrl('createCharacter/fonModal.png')}
          alt="Login Modal Background"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
          }}
        />

        {mode === 'username' ? (
          /* ФОРМА ЛОГИН/ПАРОЛЬ */
          <>
            {/* Поле логина */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -70%)',
              zIndex: 3,
              width: '90%',
              height: '90px',
            }}>
              <img
                src={getAssetUrl('createCharacter/inputName.png')}
                alt="Input Username"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 2,
                }}
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Логин (мин. 3 символа)"
                style={{
                  position: 'relative',
                  zIndex: 3,
                  width: '100%',
                  height: '100%',
                  padding: '15px 20px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  border: 'none',
                  background: 'transparent',
                  color: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onKeyPress={(e) => e.key === 'Enter' && (isRegister ? handleRegister() : handleLogin())}
              />
            </div>

            {/* Поле пароля */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, 30%)',
              zIndex: 3,
              width: '90%',
              height: '90px',
            }}>
              <img
                src={getAssetUrl('createCharacter/inputName.png')}
                alt="Input Password"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 2,
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль (мин. 6 символов)"
                style={{
                  position: 'relative',
                  zIndex: 3,
                  width: '100%',
                  height: '100%',
                  padding: '15px 20px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  border: 'none',
                  background: 'transparent',
                  color: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onKeyPress={(e) => e.key === 'Enter' && (isRegister ? handleRegister() : handleLogin())}
              />
            </div>

            {/* Кнопка входа/регистрации */}
            <div
              onClick={(isRegistering || isLoggingIn) ? undefined : (isRegister ? handleRegister : handleLogin)}
              style={{
                position: 'absolute',
                bottom: '-50px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 3,
                width: '500px',
                height: '150px',
                cursor: (isRegistering || isLoggingIn) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: (isRegistering || isLoggingIn) ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isRegistering && !isLoggingIn) {
                  e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
                  e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 15px rgba(255, 215, 0, 0.6))';
                }
              }}
              onMouseLeave={(e) => {
                if (!isRegistering && !isLoggingIn) {
                  e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
                  e.currentTarget.style.filter = 'brightness(1)';
                }
              }}
            >
              <img
                src={getAssetUrl('createCharacter/buttonEnter.png')}
                alt={isRegistering || isLoggingIn ? 'Загрузка...' : isRegister ? 'Зарегистрироваться' : 'Войти'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Кнопки переключения сверху над формой */}
            <div style={{
              position: 'absolute',
              top: '-60px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 4,
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
            }}>
              {/* Переключатель вход/регистрация */}
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: '#ffd700',
                  border: '1px solid #ffd700',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {isRegister ? 'Войти' : 'Регистрация'}
              </button>

              {/* Кнопка войти через Telegram */}
              <button
                onClick={() => {
                  setMode('telegram');
                  setError('');
                  setShowCodeInput(false);
                  setCode('');
                }}
                style={{
                  background: 'rgba(0, 136, 204, 0.5)',
                  color: '#fff',
                  border: '1px solid #0088cc',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                Войти через Telegram
              </button>
            </div>
          </>
        ) : (
          /* ФОРМА TELEGRAM */
          <>
            {!showCodeInput ? (
              <>
                {/* Поле Telegram username */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -80%)',
                  zIndex: 3,
                  width: '90%',
                  height: '90px',
                }}>
                  <img
                    src={getAssetUrl('createCharacter/inputName.png')}
                    alt="Input Telegram"
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      zIndex: 2,
                    }}
                  />
                  <input
                    type="text"
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    placeholder="Telegram username"
                    style={{
                      position: 'relative',
                      zIndex: 3,
                      width: '100%',
                      height: '100%',
                      padding: '15px 20px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      border: 'none',
                      background: 'transparent',
                      color: '#fff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleOpenTelegramBot()}
                  />
                </div>

                {/* Кнопка открыть бота */}
                <div
                  onClick={handleOpenTelegramBot}
                  style={{
                    position: 'absolute',
                    bottom: '30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 3,
                    width: '650px',
                    height: '220px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
                    e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 15px rgba(255, 215, 0, 0.6))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
                    e.currentTarget.style.filter = 'brightness(1)';
                  }}
                >
                  <img
                    src={getAssetUrl('createCharacter/buttonEnter.png')}
                    alt="Открыть бота"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Поле ввода кода */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -80%)',
                  zIndex: 3,
                  width: '90%',
                  height: '90px',
                }}>
                  <img
                    src={getAssetUrl('createCharacter/inputName.png')}
                    alt="Input Code"
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      zIndex: 2,
                    }}
                  />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Код из Telegram"
                    maxLength={6}
                    style={{
                      position: 'relative',
                      zIndex: 3,
                      width: '100%',
                      height: '100%',
                      padding: '15px 20px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      border: 'none',
                      background: 'transparent',
                      color: '#fff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleVerifyCode()}
                    autoFocus
                  />
                </div>

                {/* Кнопка проверить код */}
                <div
                  onClick={isVerifying ? undefined : handleVerifyCode}
                  style={{
                    position: 'absolute',
                    bottom: '30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 3,
                    width: '650px',
                    height: '220px',
                    cursor: isVerifying ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: isVerifying ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isVerifying) {
                      e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
                      e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 15px rgba(255, 215, 0, 0.6))';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isVerifying) {
                      e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
                      e.currentTarget.style.filter = 'brightness(1)';
                    }
                  }}
                >
                  <img
                    src={getAssetUrl('createCharacter/buttonEnter.png')}
                    alt={isVerifying ? 'Проверка...' : 'Войти'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
