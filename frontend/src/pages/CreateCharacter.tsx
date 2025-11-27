import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCharacterMutation, useGetCharacterByNameQuery } from '../store/api/characterApi';
import type { CharacterClass } from '../types/api';

// Импортируем изображения, видео и музыку
import backgroundVideo from '../assets/choosePlayer/animatedBackground.mp4';
import backgroundMusic from '../assets/choosePlayer/backgroundIntro.mp3';
import warriorImg from '../assets/choosePlayer/warrior (1).png';
import mageImg from '../assets/choosePlayer/mage (1).png';
import rogueImg from '../assets/choosePlayer/rogue (1).png';
import enterNameImg from '../assets/choosePlayer/enterName (1).png';
import createCharacterImg from '../assets/choosePlayer/createCharacter (1).png';

const CLASS_INFO: Record<CharacterClass, { name: string; image: string }> = {
  warrior: { name: 'Воин', image: warriorImg },
  mage: { name: 'Маг', image: mageImg },
  rogue: { name: 'Разбойник', image: rogueImg },
};

const CreateCharacter = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'create'>('create');
  const [loginName, setLoginName] = useState('');
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [hoveredClass, setHoveredClass] = useState<CharacterClass | null>(null);
  const [error, setError] = useState('');
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
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
    setIsMusicPlaying(!isMusicPlaying);
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
    gap: '45px',
    marginBottom: '20px',
    position: 'relative',
    zIndex: 2,
  };

  const classButtonStyle = (cls: CharacterClass): React.CSSProperties => {
    const isSelected = selectedClass === cls;
    const isHovered = hoveredClass === cls;

    return {
      width: '245px', // 350 * 0.7
      height: '315px', // 450 * 0.7
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
      border: 'none',
      background: isSelected ? 'radial-gradient(circle, rgba(255, 253, 208, 0.3) 0%, rgba(255, 247, 153, 0.2) 50%, transparent 70%)' : 'transparent',
      padding: 0,
      filter: isHovered ? 'brightness(1.2) drop-shadow(0 0 20px rgba(255, 253, 208, 0.6))' : 'brightness(1)',
      transform: isHovered ? 'scale(1.08)' : 'scale(1)',
      borderRadius: '10px',
    };
  };

  const inputContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '700px', // Базовый размер, можно масштабировать
    height: '250px', // Базовый размер, можно масштабировать
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '60px', // Увеличил отступ снизу, чтобы не прилипал к иконкам
    marginTop: '20px', // Опустил вниз
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
    width: '700px', // Уменьшил в 1.5 раза (1050 / 1.5)
    height: '360px', // Уменьшил в 1.5 раза (540 / 1.5)
    cursor: isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    zIndex: 2,
    marginTop: '-60px',
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
  };

  const musicButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '30px',
    left: '30px', // В левом верхнем углу
    padding: '10px 20px',
    border: '2px solid #fff',
    background: isMusicPlaying ? 'rgba(255, 215, 0, 0.8)' : 'rgba(220, 38, 38, 0.8)',
    color: '#fff',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    zIndex: 10,
  };

  const modeButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    margin: '0 5px',
    border: '2px solid #fff',
    background: isActive ? 'rgba(255, 215, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
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
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/* Фоновая музыка */}
      <audio ref={audioRef} loop>
        <source src={backgroundMusic} type="audio/mpeg" />
      </audio>

      {/* Кнопка управления музыкой */}
      <button onClick={toggleMusic} style={musicButtonStyle}>
        {isMusicPlaying ? '🔊 Музыка' : '🔇 Музыка'}
      </button>

      {/* Переключатель режимов */}
      <div style={modeSwitchStyle}>
        <button
          onClick={() => {
            setMode('create');
            setError('');
          }}
          style={modeButtonStyle(mode === 'create')}
        >
          Создать
        </button>
        <button
          onClick={() => {
            setMode('login');
            setError('');
          }}
          style={modeButtonStyle(mode === 'login')}
        >
          Войти
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
                  style={{ width: '100%', height: '70%', objectFit: 'cover' }}
                />
              </button>
            ))}
          </div>

          {/* Поле ввода имени */}
          <div style={inputContainerStyle}>
            <img
              src={enterNameImg}
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
              src={createCharacterImg}
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
        /* Форма входа (простая версия) */
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '40px',
          borderRadius: '20px',
          border: '3px solid #ffd700',
          zIndex: 2,
        }}>
          <h2 style={{ color: '#ffd700', marginBottom: '20px', textAlign: 'center' }}>
            Вход в игру
          </h2>
          <input
            type="text"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            placeholder="Введите имя персонажа"
            style={{
              ...inputStyle,
              width: '300px',
              marginBottom: '20px',
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button
            onClick={handleLogin}
            disabled={isSearching}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              background: isSearching ? '#666' : '#ffd700',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              cursor: isSearching ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (!isSearching) {
                e.currentTarget.style.background = '#ffed4e';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isSearching ? '#666' : '#ffd700';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isSearching ? 'Поиск...' : 'Войти'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateCharacter;
