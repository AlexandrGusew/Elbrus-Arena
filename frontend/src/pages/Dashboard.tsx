import { Link, useNavigate } from 'react-router-dom';
import {
  useGetCharacterQuery,
  useGetStaminaInfoQuery,
  useTestLevelBoostMutation,
  useGetMyCharacterQuery,
  useAutoCreateCharactersMutation,
  useUpdateCharacterNameMutation,
} from '../store/api/characterApi';
import { useLogoutMutation } from '../store/api/authApi';
import { setAccessToken } from '../store/api/baseApi';
import { styles } from './Dashboard.styles';
import { useState, useEffect, useRef } from 'react';
import { getAssetUrl } from '../utils/assetUrl';
import { ChatWindow } from '../components/ChatWindow';
import { CharacterSelector } from '../components/CharacterSelector';
import type { Character } from '../types/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const characterIdFromStorage = localStorage.getItem('characterId');
  const [boostMessage, setBoostMessage] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Состояние для выбора персонажа
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(
    characterIdFromStorage ? Number(characterIdFromStorage) : null
  );
  const [characters, setCharacters] = useState<Character[]>([]);

  // Загружаем настройку музыки из localStorage
  const [isMusicPlaying, setIsMusicPlaying] = useState(() => {
    const savedMusicState = localStorage.getItem('musicPlaying');
    return savedMusicState !== null ? savedMusicState === 'true' : true;
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioRef2 = useRef<HTMLAudioElement>(null);

  // Загружаем персонажей текущего пользователя через /character/me
  const { data: myCharacters, isLoading: isLoadingCharacters, refetch: refetchMyCharacters } = useGetMyCharacterQuery();

  // Получаем персонажа для отображения (из выбранного)
  const { data: character, isLoading, error } = useGetCharacterQuery(
    Number(selectedCharacterId),
    { skip: !selectedCharacterId }
  );

  const { data: staminaInfo } = useGetStaminaInfoQuery(
    Number(selectedCharacterId),
    {
      skip: !selectedCharacterId || !character || !!error,
      pollingInterval: 1000,
    }
  );

  // Мутации для работы с персонажами
  const [autoCreateCharacters] = useAutoCreateCharactersMutation();
  const [updateCharacterName] = useUpdateCharacterNameMutation();

  const [testLevelBoost, { isLoading: isBoostLoading }] = useTestLevelBoostMutation();
  const [logout] = useLogoutMutation();

  // Обработчик выхода
  const handleLogout = async () => {
    try {
      // Вызываем logout API для очистки refresh token в cookie
      await logout().unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Очищаем access token из памяти
      setAccessToken(null);
      // Очищаем localStorage
      localStorage.removeItem('characterId');
      localStorage.removeItem('isAuthenticated');
      // Переходим на страницу входа
      navigate('/');
    }
  };

  // Загружаем персонажей пользователя и автосоздаем, если их нет
  useEffect(() => {
    console.log('[Dashboard] myCharacters changed:', myCharacters);

    if (myCharacters !== undefined) {
      // Убеждаемся, что это массив
      const charactersArray = Array.isArray(myCharacters) ? myCharacters : [];
      console.log('[Dashboard] Setting characters array:', charactersArray);
      setCharacters(charactersArray);

      // Если персонажей меньше 3 - создаем автоматически недостающих
      if (charactersArray.length < 3) {
        console.log(`[Dashboard] Found ${charactersArray.length} characters, need 3. Attempting auto-create`);
        autoCreateCharacters()
          .unwrap()
          .then((created) => {
            const createdArray = Array.isArray(created) ? created : [];
            console.log('[Dashboard] Auto-created characters:', createdArray);
            console.log('[Dashboard] Created characters details:', createdArray.map(c => ({ id: c.id, name: c.name, class: c.class })));
            // Обновляем список персонажей через рефетч
            refetchMyCharacters().then((result) => {
              const freshCharacters = Array.isArray(result.data) ? result.data : [];
              console.log('[Dashboard] Refetched characters after auto-create:', freshCharacters);
              setCharacters(freshCharacters);
              // Выбираем первого персонажа, если не выбран
              if (freshCharacters.length > 0 && !selectedCharacterId) {
                setSelectedCharacterId(freshCharacters[0].id);
                localStorage.setItem('characterId', freshCharacters[0].id.toString());
              }
            });
          })
          .catch((error) => {
            console.error('[Dashboard] Failed to auto-create characters:', error);
            console.error('[Dashboard] Error details:', error.status, error.data);
          });
      } else if (charactersArray.length > 0 && !selectedCharacterId) {
        // Если есть персонажи, но не выбран - выбираем первого
        console.log('[Dashboard] Selecting first character:', charactersArray[0].id);
        setSelectedCharacterId(charactersArray[0].id);
        localStorage.setItem('characterId', charactersArray[0].id.toString());
      }
    }
  }, [myCharacters, selectedCharacterId, autoCreateCharacters, refetchMyCharacters]);

  // Обработчики для выбора персонажа
  const handleSelectCharacter = (characterId: number) => {
    setSelectedCharacterId(characterId);
    localStorage.setItem('characterId', characterId.toString());
  };

  const handleUpdateName = async (characterId: number, newName: string) => {
    try {
      await updateCharacterName({ characterId, name: newName }).unwrap();
      // Обновляем список персонажей
      const updatedCharacters = characters.map((c) =>
        c.id === characterId ? { ...c, name: newName } : c
      );
      setCharacters(updatedCharacters);
    } catch (error) {
      console.error('Failed to update character name:', error);
      throw error;
    }
  };

  // Управление музыкой с crossfade
  useEffect(() => {
    const audio1 = audioRef.current;
    const audio2 = audioRef2.current;
    if (!audio1 || !audio2) return;

    let currentAudio = audio1;
    let nextAudio = audio2;
    const FADE_DURATION = 2; // 2 секунды для crossfade
    const LOOP_START = 5;
    const LOOP_END = 25;

    const setupAudio = (audio: HTMLAudioElement) => {
      audio.currentTime = LOOP_START;
      audio.volume = 0;
    };

    setupAudio(audio2);
    audio1.currentTime = LOOP_START;
    audio1.volume = isMusicPlaying ? 1 : 0;

    if (isMusicPlaying) {
      audio1.play().catch((e) => console.log('Autoplay blocked:', e));
    }

    const handleTimeUpdate = () => {
      const currentTime = currentAudio.currentTime;

      // За FADE_DURATION секунд до конца начинаем crossfade
      if (currentTime >= LOOP_END - FADE_DURATION) {
        const fadeProgress = (currentTime - (LOOP_END - FADE_DURATION)) / FADE_DURATION;

        if (nextAudio.paused && isMusicPlaying) {
          nextAudio.currentTime = LOOP_START;
          nextAudio.play().catch((e) => console.log('Play blocked:', e));
        }

        // Плавное затухание текущего трека и нарастание следующего
        currentAudio.volume = isMusicPlaying ? (1 - fadeProgress) : 0;
        nextAudio.volume = isMusicPlaying ? fadeProgress : 0;
      }

      // Когда достигли конца, меняем треки местами
      if (currentTime >= LOOP_END) {
        currentAudio.pause();
        currentAudio.currentTime = LOOP_START;
        currentAudio.volume = 0;

        // Меняем местами
        const temp = currentAudio;
        currentAudio = nextAudio;
        nextAudio = temp;
      }
    };

    audio1.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio1.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isMusicPlaying]);

  // Управление play/pause при переключении музыки
  useEffect(() => {
    if (audioRef.current && audioRef2.current) {
      if (isMusicPlaying) {
        audioRef.current.play().catch((e) => console.log('Autoplay blocked:', e));
      } else {
        audioRef.current.pause();
        audioRef2.current.pause();
        audioRef.current.volume = 0;
        audioRef2.current.volume = 0;
      }
    }
  }, [isMusicPlaying]);

  const toggleMusic = () => {
    const newState = !isMusicPlaying;
    setIsMusicPlaying(newState);
    // Сохраняем настройку в localStorage
    localStorage.setItem('musicPlaying', String(newState));
  };

  const handleLevelBoost = async () => {
    if (!selectedCharacterId) return;
    try {
      const result = await testLevelBoost(Number(selectedCharacterId)).unwrap();
      setBoostMessage(result.message);
      setTimeout(() => setBoostMessage(null), 5000);
    } catch (error: any) {
      setBoostMessage(error?.data?.message || 'Ошибка');
      setTimeout(() => setBoostMessage(null), 5000);
    }
  };


  // Выбор видео героя по классу
  return (
    <div style={{ position: 'relative', width: '1366px', height: '768px', overflow: 'hidden' }}>
      {/* Видео фон */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
        }}
      >
        <source src={getAssetUrl('dashboard/mainCityBackground.mp4')} type="video/mp4" />
      </video>

      {/* Фоновая музыка - два трека для crossfade */}
      <audio 
        ref={audioRef}
        onError={(e) => {
          console.warn('[Dashboard] Audio file not found, music will be disabled');
          setIsMusicPlaying(false);
        }}
      >
        <source src={getAssetUrl('dashboard/mainCity.mp3')} type="audio/mpeg" />
      </audio>
      <audio 
        ref={audioRef2}
        onError={(e) => {
          console.warn('[Dashboard] Audio file not found, music will be disabled');
          setIsMusicPlaying(false);
        }}
      >
        <source src={getAssetUrl('dashboard/mainCity.mp3')} type="audio/mpeg" />
      </audio>

      {/* Кнопки управления - верх страницы по центру */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '2.5px',
        zIndex: 1000,
      }}>
        {/* Кнопка музыки */}
        <button
          onClick={toggleMusic}
          style={{
            padding: '0',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            width: '100px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.filter = 'brightness(1.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          <img
            src={getAssetUrl('dashboard/music.png')}
            alt="Music"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '4px',
            }}
          />
        </button>

        {/* Кнопка чата */}
        <button
          onClick={() => setIsChatOpen(true)}
          style={{
            padding: '0',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            width: '100px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.filter = 'brightness(1.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          <img
            src={getAssetUrl('dashboard/buttonChat.png')}
            alt="Chat"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '4px',
            }}
          />
        </button>

        {/* Кнопка выхода */}
        <button
          onClick={handleLogout}
          style={{
            padding: '0',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            width: '100px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.filter = 'brightness(1.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          <img
            src={getAssetUrl('dashboard/exit.png')}
            alt="Exit"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '4px',
            }}
          />
        </button>
      </div>

      <div style={{
        display: 'none',
      }}>

        {/* Кнопка теста */}
        <button
          onClick={handleLevelBoost}
          disabled={isBoostLoading}
          style={{
            padding: '5px',
            border: '1px solid #fff',
            background: isBoostLoading ? 'rgba(128, 128, 128, 0.8)' : 'rgba(255, 152, 0, 0.8)',
            color: '#fff',
            fontSize: '10px',
            cursor: isBoostLoading ? 'not-allowed' : 'pointer',
            borderRadius: '2px',
            transition: 'all 0.3s ease',
            width: '25px',
            height: '25px',
            display: 'none', // Скрыто
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          🚀
        </button>
      </div>

      {/* Навигационные кнопки - сетка 2x3 слева */}
      {selectedCharacterId && (
        <div style={{
          position: 'absolute',
          left: '10px',
          top: '120px', // Начинаются ниже кнопок музыки/чата/выхода
          bottom: '10px', // Растягиваем до низа
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)', // Равномерно распределяем по высоте
          gap: '8px', // Уменьшили расстояние между кнопками
          alignItems: 'stretch',
          justifyItems: 'stretch',
          zIndex: 1000,
        }}>
          <Link to="/dungeon" style={{ display: 'block' }}>
            <img
              src={getAssetUrl('dashboard/dungeons.png')}
              alt="Подземелье"
              style={{
                width: '216px',
                height: '126px',
                objectFit: 'cover',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'transparent',
                borderRadius: '4px',
              }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          />
        </Link>
        <Link to="/inventory" style={{ display: 'block' }}>
          <img
            src={getAssetUrl('dashboard/inventory.png')}
            alt="Инвентарь"
            style={{
              width: '216px',
              height: '126px',
              objectFit: 'cover',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'transparent',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          />
        </Link>
        <Link to="/blacksmith" style={{ display: 'block' }}>
          <img
            src={getAssetUrl('dashboard/blacksmith.png')}
            alt="Кузница"
            style={{
              width: '216px',
              height: '126px',
              objectFit: 'cover',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'transparent',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          />
        </Link>
        <Link to="/pvp" style={{ display: 'block' }}>
          <img
            src={getAssetUrl('dashboard/pvp.png')}
            alt="PvP"
            style={{
              width: '216px',
              height: '126px',
              objectFit: 'cover',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'transparent',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          />
        </Link>
        <Link to="/specialization" style={{ display: 'block' }}>
          <img
            src={getAssetUrl('dashboard/specialization.png')}
            alt="Специализация"
            style={{
              width: '216px',
              height: '126px',
              objectFit: 'cover',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'transparent',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          />
        </Link>
        <Link to="/class-mentor" style={{ display: 'block' }}>
          <img
            src={getAssetUrl('dashboard/mentor.png')}
            alt="Наставник"
            style={{
              width: '216px',
              height: '126px',
              objectFit: 'cover',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'transparent',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          />
        </Link>
        </div>
      )}

      {/* Основной контент - показывается только если выбран персонаж */}
      {selectedCharacterId && character ? (
        <>
      {/* Кнопка Level Up - появляется только когда есть свободные очки */}
      {character.freePoints > 0 && (
        <Link to="/inventory" style={{
          position: 'absolute',
          top: '142.5px', // Сразу под портретом
          left: '20px',
          width: '75px',
          height: '30px',
          zIndex: 1000,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'none', // Скрыто
        }}>
          <img
            src={getAssetUrl('dashboard/lvlup.png')}
            alt="Level Up"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '4px',
              boxShadow: '0 4px 15px rgba(255, 215, 0, 0.6)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          />
        </Link>
      )}


      <div style={{ ...styles.container, position: 'relative', zIndex: 2, height: '768px', overflowY: 'auto' }}>
      {boostMessage && (
        <div style={{
          marginTop: '5px',
          marginBottom: '10px',
          padding: '5px',
          background: '#4caf50',
          borderRadius: '2px',
          fontSize: '7px',
          textAlign: 'center',
        }}>
          {boostMessage}
        </div>
      )}


      </div>
        </>
      ) : (
        /* Сообщение о выборе персонажа */
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#ffd700',
          fontSize: '24px',
          fontFamily: "'IM Fell English', serif",
          textShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
          zIndex: 1000,
        }}>
          {isLoadingCharacters ? (
            'Загрузка персонажей...'
          ) : (
            'Выберите персонажа'
          )}
        </div>
      )}

      {/* CharacterSelector - всегда видим справа */}
      <CharacterSelector
        characters={characters || []}
        selectedCharacterId={selectedCharacterId}
        onSelectCharacter={handleSelectCharacter}
        onUpdateName={handleUpdateName}
      />

      {/* Окно чата */}
      {character && (
        <ChatWindow
          characterId={character.id}
          characterName={character.name}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
