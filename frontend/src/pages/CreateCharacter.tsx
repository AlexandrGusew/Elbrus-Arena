import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCharacterMutation, useGetCharacterByNameQuery, useGetMyCharacterQuery } from '../store/api/characterApi';
import type { CharacterClass } from '../types/api';
import { getAssetUrl } from '../utils/assetUrl';

const CreateCharacter = () => {
  const navigate = useNavigate();
  const [loginName, setLoginName] = useState('');
  const [error, setError] = useState('');
  const [isMusicPlaying, setIsMusicPlaying] = useState(() => {
    const savedMusicState = localStorage.getItem('musicPlaying');
    return savedMusicState !== null ? savedMusicState === 'true' : true;
  });
  const audioRef = useRef<HTMLAudioElement>(null);

  const [searchName, setSearchName] = useState<string | null>(null);

  // Проверяем есть ли персонаж у текущего пользователя
  const { data: myCharacter, isLoading: isCheckingCharacter } = useGetMyCharacterQuery();

  const { data: foundCharacter, isLoading: isSearching, isSuccess } = useGetCharacterByNameQuery(
    searchName || '',
    { skip: !searchName }
  );

  // Если персонажи уже есть - редирект на dashboard
  useEffect(() => {
    if (myCharacter && myCharacter.length > 0) {
      localStorage.setItem('characterId', myCharacter[0].id.toString());
      navigate('/app/dashboard');
    }
  }, [myCharacter, navigate]);

  useEffect(() => {
    if (searchName && isSuccess) {
      if (foundCharacter) {
        // Сохранить ID персонажа
        localStorage.setItem('characterId', foundCharacter.id.toString());
        navigate('/dashboard');
      } else {
        setError('Персонаж не найден');
        setSearchName(null);
      }
    }
  }, [foundCharacter, isSuccess, searchName, navigate]);

  // Управление музыкой
  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.play().catch((e) => console.log('Autoplay blocked:', e));
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

  const handleLogin = async () => {
    if (!loginName.trim()) {
      setError('Введите имя персонажа');
      return;
    }
    setError('');
    setSearchName(loginName.trim());
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

  const musicButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '30px',
    right: '30px',
    width: '400px',
    height: '160px',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    padding: 0,
    transition: 'all 0.3s ease',
    zIndex: 10,
  };

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

      {/* Кнопка управления музыкой */}
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

      {/* Ошибка */}
      {error && <div style={errorStyle}>{error}</div>}

      {/* Форма входа */}
      <div style={{
        position: 'relative',
        width: '700px',
        height: '450px',
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

        {/* Поле ввода имени с фоновым изображением */}
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
            alt="Input Name"
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
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            placeholder=""
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
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {/* Кнопка входа */}
        <div
          onClick={isSearching ? undefined : handleLogin}
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            width: '650px',
            height: '220px',
            cursor: isSearching ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            opacity: isSearching ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isSearching) {
              e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
              e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 15px rgba(255, 215, 0, 0.6))';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSearching) {
              e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }
          }}
        >
          <img
            src={getAssetUrl('createCharacter/buttonEnter.png')}
            alt={isSearching ? 'Поиск...' : 'Войти'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateCharacter;
