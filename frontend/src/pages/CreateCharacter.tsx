import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCharacterMutation, useGetCharacterByNameQuery } from '../store/api/characterApi';
import type { CharacterClass } from '../types/api';
import { getAssetUrl } from '../utils/assetUrl';

const CLASS_INFO: Record<CharacterClass, { name: string; image: string }> = {
  warrior: { name: 'Воин', image: getAssetUrl('createCharacter/warrior (1).png') },
  mage: { name: 'Маг', image: getAssetUrl('createCharacter/mage (1).png') },
  rogue: { name: 'Разбойник', image: getAssetUrl('createCharacter/rogue (1).png') },
};

const CreateCharacter = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'create'>('create');
  const [loginName, setLoginName] = useState('');
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [hoveredClass, setHoveredClass] = useState<CharacterClass | null>(null);
  const [error, setError] = useState('');
  const [isMusicPlaying, setIsMusicPlaying] = useState(() => {
    const savedMusicState = localStorage.getItem('musicPlaying');
    return savedMusicState !== null ? savedMusicState === 'true' : true;
  });
  const audioRef = useRef<HTMLAudioElement>(null);

  const [createCharacter, { isLoading }] = useCreateCharacterMutation();
  const [searchName, setSearchName] = useState<string | null>(null);

  const { data: foundCharacter, isLoading: isSearching, isSuccess } = useGetCharacterByNameQuery(
    searchName || '',
    { skip: !searchName }
  );

  useEffect(() => {
    if (searchName && isSuccess) {
      if (foundCharacter) {
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

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Введите имя персонажа');
      return;
    }

    if (!selectedClass) {
      setError('Выберите класс персонажа');
      return;
    }

    setError('');

    try {
      const fakeTelegramId = Math.floor(Math.random() * 1000000000);
      const character = await createCharacter({
        telegramId: fakeTelegramId,
        name: name.trim(),
        class: selectedClass,
      }).unwrap();

      localStorage.setItem('characterId', character.id.toString());
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.data?.message || err.message || 'Ошибка при создании персонажа');
    }
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

  const classButtonsContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '30px',
    marginBottom: '5px',
    position: 'relative',
    zIndex: 2,
  };

  const classButtonStyle = (cls: CharacterClass): React.CSSProperties => {
    const isSelected = selectedClass === cls;
    const isHovered = hoveredClass === cls;
    const isActive = isSelected || isHovered; // При выборе ИЛИ наведении - одинаковый эффект

    return {
      width: '340px',
      height: '440px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
      border: 'none',
      padding: 0,
      filter: isActive ? 'brightness(1.2) drop-shadow(0 0 20px rgba(255, 253, 208, 0.6))' : 'brightness(1)',
      transform: isActive ? 'scale(1.08)' : 'scale(1)',
      borderRadius: '10px',
    };
  };

  const inputContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '600px',
    height: '210px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '30px',
    marginTop: '0px',
    zIndex: 2,
  };

  const inputStyle: React.CSSProperties = {
    position: 'absolute',
    width: '55%',
    padding: '14px 25px',
    fontSize: '28px', // Увеличил размер шрифта
    fontWeight: 'bold',
    textAlign: 'center',
    border: 'none',
    background: 'transparent',
    color: '#000', // Черный цвет текста
    borderRadius: '8px',
    outline: 'none',
    fontFamily: 'Arial, sans-serif',
    top: '52%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 3,
    caretColor: '#000', // Черная каретка
  };

  const createButtonContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '600px',
    height: '310px',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    zIndex: 2,
    marginTop: '-70px',
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

      {/* Кнопки управления - все в одной колонке справа */}
      <div style={modeSwitchStyle}>
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

        {/* Кнопка Create */}
        <button
          onClick={() => {
            setMode('create');
            setError('');
          }}
          style={modeButtonStyle(mode === 'create')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <img
            src={getAssetUrl('createCharacter/create.png')}
            alt="Create"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </button>

        {/* Кнопка Login */}
        <button
          onClick={() => {
            setMode('login');
            setError('');
          }}
          style={modeButtonStyle(mode === 'login')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <img
            src={getAssetUrl('createCharacter/login.png')}
            alt="Login"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </button>
      </div>

      {/* Ошибка */}
      {error && <div style={errorStyle}>{error}</div>}

      {mode === 'create' ? (
        <>
          {/* Кнопки выбора класса */}
          <div style={classButtonsContainerStyle}>
            {(['warrior', 'mage', 'rogue'] as CharacterClass[]).map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                onMouseEnter={() => setHoveredClass(cls)}
                onMouseLeave={() => setHoveredClass(null)}
                style={{
                  ...classButtonStyle(cls),
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={CLASS_INFO[cls].image}
                  alt={CLASS_INFO[cls].name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                />
              </button>
            ))}
          </div>

          {/* Поле ввода имени */}
          <div style={inputContainerStyle}>
            <img
              src={getAssetUrl('createCharacter/enterName (1).png')}
              alt="Enter Name"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                zIndex: 2,
              }}
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=""
              style={inputStyle}
              onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
              maxLength={20}
            />
          </div>

          {/* Кнопка создания персонажа */}
          <div
            onClick={!isLoading ? handleCreate : undefined}
            style={{
              ...createButtonContainerStyle,
              opacity: isLoading ? 0.6 : 1,
              filter: isLoading ? 'grayscale(0.5)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 15px rgba(255, 215, 0, 0.6))';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = isLoading ? 'grayscale(0.5)' : 'none';
            }}
          >
            <img
              src={getAssetUrl('createCharacter/createCharacter (1).png')}
              alt="Create Character"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
              }}
            />
          </div>
        </>
      ) : (
        /* Форма входа */
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
      )}
    </div>
  );
};

export default CreateCharacter;
