import { useNavigate } from 'react-router-dom';
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
import { store } from '../store';
import { baseApi } from '../store/api/baseApi';
import { useState, useEffect, useRef } from 'react';
import { getAssetUrl } from '../utils/assetUrl';
import borderPattern from '../assets/border/pattern.svg';
import { ChatWindow } from '../components/ChatWindow';
import { CharacterCard } from '../components/dashboard/CharacterCard';
import { ChatSection } from '../components/dashboard/ChatSection';
import { InventorySection } from '../components/dashboard/InventorySection';
import { ForgeSection } from '../components/dashboard/ForgeSection';
import { NavigationButtons } from '../components/dashboard/NavigationButtons';
import { LevelUpSection } from '../components/dashboard/LevelUpSection';
import { CharacterSelector } from '../components/CharacterSelector';
import { Volume2, VolumeX, LogOut } from 'lucide-react';
import type { InventoryItem } from '../types/api';
import { dashboardColors, dashboardFonts, dashboardEffects, cornerOrnaments, mainContainer } from '../styles/dashboard.styles';

const Dashboard = () => {
  const navigate = useNavigate();
  const characterIdFromStorage = localStorage.getItem('characterId');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Состояние для управления секциями
  const [activeSection, setActiveSection] = useState<'main' | 'inventory' | 'levelup'>('main');
  const [showForge, setShowForge] = useState(false);

  // Состояние для слотов кузницы
  const [forgeItemSlot, setForgeItemSlot] = useState<any | null>(null); // TODO: типизировать

  // Состояние для выбранного предмета (для Item Details Section)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Загружаем настройку музыки из localStorage
  const [isMusicPlaying, setIsMusicPlaying] = useState(() => {
    const savedMusicState = localStorage.getItem('musicPlaying');
    return savedMusicState !== null ? savedMusicState === 'true' : false;
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioRef2 = useRef<HTMLAudioElement>(null);

  // Получаем персонажа из localStorage
  const [characterId, setCharacterId] = useState<number | null>(
    characterIdFromStorage ? Number(characterIdFromStorage) : null
  );

  // Синхронизируем characterId с localStorage при изменении
  useEffect(() => {
    if (characterId) {
      localStorage.setItem('characterId', characterId.toString());
    } else {
      localStorage.removeItem('characterId');
    }
  }, [characterId]);

  const { data: character, isLoading, error } = useGetCharacterQuery(
    characterId!,
    { skip: !characterId }
  );

  const { data: staminaInfo } = useGetStaminaInfoQuery(
    characterId!,
    {
      skip: !characterId || !character || !!error,
      pollingInterval: 1000,
    }
  );

  const [logout] = useLogoutMutation();
  const [testLevelBoost, { isLoading: isBoostLoading }] = useTestLevelBoostMutation();
  const [boostMessage, setBoostMessage] = useState<string | null>(null);

  // Получаем список персонажей пользователя
  const { data: myCharacters = [], isLoading: isLoadingCharacters } = useGetMyCharacterQuery();
  const [autoCreateCharacters, { isLoading: isCreatingCharacters }] = useAutoCreateCharactersMutation();
  const [updateCharacterName] = useUpdateCharacterNameMutation();

  // Автоматически создаем персонажей, если их нет
  useEffect(() => {
    if (!isLoadingCharacters && myCharacters.length === 0) {
      autoCreateCharacters().catch((error) => {
        console.error('Error auto-creating characters:', error);
      });
    }
  }, [isLoadingCharacters, myCharacters.length, autoCreateCharacters]);

  // Автоматически выбираем первого персонажа, если есть персонажи, но не выбран
  useEffect(() => {
    if (myCharacters.length > 0 && !characterId) {
      const firstCharacter = myCharacters[0];
      setCharacterId(firstCharacter.id);
    }
  }, [myCharacters, characterId]);

  // Обработчик выбора персонажа
  const handleSelectCharacter = (newCharacterId: number) => {
    setCharacterId(newCharacterId);
  };

  // Обработчик обновления имени персонажа
  const handleUpdateName = async (characterId: number, newName: string) => {
    await updateCharacterName({ characterId, name: newName }).unwrap();
  };

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
      // Очищаем состояние персонажа
      setCharacterId(null);
      // Очищаем localStorage
      localStorage.removeItem('characterId');
      localStorage.removeItem('isAuthenticated');
      // Очищаем весь кэш RTK Query
      store.dispatch(baseApi.util.resetApiState());
      // Переходим на страницу входа
      navigate('/');
    }
  };

  // Если нет персонажа, просто не показываем контент
  // CharacterSelector или логика выбора персонажа может быть добавлена позже

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

  // Обработчик навигации назад
  const handleBack = () => {
    if (showForge) {
      // Если открыт forge - сначала закрываем его
      setShowForge(false);
    } else if (activeSection === 'inventory' || activeSection === 'levelup') {
      // Если открыт инвентарь или levelup - возвращаемся на главную секцию
      setActiveSection('main');
    }
  };

  const handleLevelBoost = async () => {
    if (!characterId) return;
    try {
      const result = await testLevelBoost(characterId).unwrap();
      setBoostMessage(result.message);
      setTimeout(() => setBoostMessage(null), 5000);
    } catch (error: any) {
      setBoostMessage(error?.data?.message || 'Ошибка');
      setTimeout(() => setBoostMessage(null), 5000);
    }
  };


  // Выбор видео героя по классу
  return (
    <div style={{ position: 'relative', width: '1440px', height: '1080px', overflow: 'hidden' }}>

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

      {/* Кнопки управления - верхний правый угол */}
      <div style={{
        position: 'absolute',
        top: '15px',
        right: '15px',
        display: 'flex',
        gap: '8px',
        zIndex: 1000,
        alignItems: 'flex-start',
      }}>
        {/* Кнопка музыки */}
        <button
          onClick={toggleMusic}
          style={{
            padding: '8px 16px',
            border: `2px solid ${dashboardColors.borderGold}`,
            background: dashboardColors.backgroundMedium,
            color: dashboardColors.textGold,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            fontFamily: dashboardFonts.secondary,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            letterSpacing: '0.1em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.borderColor = dashboardColors.borderBronze;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = dashboardColors.backgroundMedium;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = dashboardColors.borderGold;
          }}
        >
          {isMusicPlaying ? (
            <Volume2 size={14} color={dashboardColors.textGold} />
          ) : (
            <VolumeX size={14} color={dashboardColors.textGold} />
          )}
          <span>MUSIC</span>
        </button>

        {/* Кнопка выхода - показываем только на главной секции */}
        {(activeSection === 'main' || activeSection === 'levelup') && (
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 18px',
              border: `2px solid ${dashboardColors.borderGold}`,
              background: dashboardColors.buttonBackground,
              color: dashboardColors.textGold,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontFamily: dashboardFonts.secondary,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '0.1em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = dashboardColors.buttonHover;
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.borderColor = dashboardColors.borderBronze;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = dashboardColors.buttonBackground;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = dashboardColors.borderGold;
            }}
          >
            <LogOut size={14} color={dashboardColors.textGold} />
            <span>EXIT</span>
          </button>
        )}

        {/* Кнопка назад - показываем только если не на главной секции */}
        {(activeSection === 'inventory' || showForge) && (
          <button
            onClick={handleBack}
            style={{
              padding: '8px 16px',
              border: `2px solid ${dashboardColors.borderGold}`,
              background: dashboardColors.backgroundMedium,
              color: dashboardColors.textGold,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontFamily: dashboardFonts.secondary,
              letterSpacing: '0.1em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.borderColor = dashboardColors.borderBronze;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = dashboardColors.backgroundMedium;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = dashboardColors.borderGold;
            }}
          >
            BACK
          </button>
        )}
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

      {/* Если персонаж выбран - показываем контент Dashboard */}
      {character ? (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          right: '16px',
          bottom: '16px',
          zIndex: 2,
        }}>
          <div style={{
            ...mainContainer,
            width: '100%',
            height: '100%',
            // SVG-рамка со всех 4 сторон через border-image
            borderWidth: '24px',
            borderStyle: 'solid',
            borderColor: 'transparent',
            borderRadius: '16px',
            borderImageSource: `url(${borderPattern})`,
            borderImageSlice: 30,
            borderImageRepeat: 'round',
            backdropFilter: 'blur(12px)',
            boxShadow: dashboardEffects.boxShadow,
            padding: '20px 12px 20px 20px',
            overflow: 'hidden',
          }}>
            {/* Corner ornaments */}
            <div style={{
              ...cornerOrnaments.topLeft,
              width: '48px',
              height: '48px',
              borderTop: '4px solid',
              borderLeft: '4px solid',
              borderColor: dashboardColors.borderGold,
            }}></div>
            <div style={{
              ...cornerOrnaments.topRight,
              width: '48px',
              height: '48px',
              borderTop: '4px solid',
              borderRight: '4px solid',
              borderColor: dashboardColors.borderGold,
            }}></div>
            <div style={{
              ...cornerOrnaments.bottomLeft,
              width: '48px',
              height: '48px',
              borderBottom: '4px solid',
              borderLeft: '4px solid',
              borderColor: dashboardColors.borderGold,
            }}></div>
            <div style={{
              ...cornerOrnaments.bottomRight,
              width: '48px',
              height: '48px',
              borderBottom: '4px solid',
              borderRight: '4px solid',
              borderColor: dashboardColors.borderGold,
            }}></div>

            <div className="grid grid-cols-[40%_60%] gap-5 h-full" style={{ overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
              {/* LEFT COLUMN */}
              <div className="flex flex-col gap-4 h-full" style={{ overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
                {/* Character Info Card OR Forge Section - больше места под слоты */}
                <div className="h-[75%]" style={{ overflow: 'hidden' }}>
                  {showForge ? (
                    <ForgeSection
                      character={character}
                      onClose={() => setShowForge(false)}
                      itemInSlot={forgeItemSlot}
                      onItemChange={setForgeItemSlot}
                    />
                  ) : (
                    <CharacterCard 
                      character={character}
                      selectedItem={selectedItem}
                      onItemSelect={setSelectedItem}
                      onLevelBarClick={() => {
                        setActiveSection('levelup');
                        setShowForge(false);
                      }}
                    />
                  )}
                </div>

                {/* Chat Section - меньше высота */}
                <div className="h-[25%]" style={{ overflow: 'hidden' }}>
                  <ChatSection characterId={character.id} characterName={character.name} />
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div style={{ width: '100%', height: '100%', overflow: 'hidden', boxSizing: 'border-box', paddingRight: '4px' }}>
              {activeSection === 'main' ? (
                <NavigationButtons
                  onInventoryClick={() => {
                    setActiveSection('inventory');
                    setShowForge(false);
                  }}
                  onForgeClick={() => {
                    // При клике на Forge из главного меню - открываем инвентарь + кузницу
                    setActiveSection('inventory');
                    setShowForge(true);
                  }}
                />
              ) : activeSection === 'inventory' ? (
                <InventorySection
                  character={character}
                  onNavigateToForge={() => {
                    // Оставляем activeSection='inventory', только показываем кузницу
                    setShowForge(true);
                  }}
                  showForge={showForge}
                  onNavigateToInventory={() => setShowForge(false)}
                  onBack={() => {
                    setActiveSection('main');
                    setShowForge(false);
                  }}
                  forgeItemSlot={forgeItemSlot}
                  onForgeItemSelect={setForgeItemSlot}
                  selectedItem={selectedItem}
                  onItemSelect={setSelectedItem}
                />
              ) : activeSection === 'levelup' ? (
                <LevelUpSection
                  character={character}
                  onBack={() => {
                    setActiveSection('main');
                    setShowForge(false);
                  }}
                />
              ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : isLoadingCharacters || isCreatingCharacters ? (
        /* Показываем загрузку при создании персонажей */
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          color: '#fff',
          fontSize: '24px',
          fontFamily: "'IM Fell English', serif",
        }}>
          {isCreatingCharacters ? 'Создание персонажей...' : 'Загрузка...'}
        </div>
      ) : myCharacters.length > 0 ? (
        /* Показываем выбор персонажа, если персонажи есть, но не выбран */
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
        }}>
          <CharacterSelector
            characters={myCharacters}
            selectedCharacterId={characterId}
            onSelectCharacter={handleSelectCharacter}
            onUpdateName={handleUpdateName}
          />
        </div>
      ) : null}

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
