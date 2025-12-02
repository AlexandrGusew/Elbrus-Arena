import { Link, useNavigate } from 'react-router-dom';
import { useGetCharacterQuery, useGetStaminaInfoQuery, useTestLevelBoostMutation } from '../store/api/characterApi';
import { styles } from './Dashboard.styles';
import { useState, useEffect, useRef } from 'react';
import { getAssetUrl } from '../utils/assetUrl';
import { ChatWindow } from '../components/ChatWindow';

const Dashboard = () => {
  const navigate = useNavigate();
  const characterId = localStorage.getItem('characterId');
  const [boostMessage, setBoostMessage] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Загружаем настройку музыки из localStorage
  const [isMusicPlaying, setIsMusicPlaying] = useState(() => {
    const savedMusicState = localStorage.getItem('musicPlaying');
    return savedMusicState !== null ? savedMusicState === 'true' : true;
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioRef2 = useRef<HTMLAudioElement>(null);

  const { data: character, isLoading, error } = useGetCharacterQuery(
    Number(characterId),
    { skip: !characterId }
  );

  const { data: staminaInfo } = useGetStaminaInfoQuery(
    Number(characterId),
    {
      skip: !characterId || !character || !!error,
      pollingInterval: 1000,
    }
  );

  const [testLevelBoost, { isLoading: isBoostLoading }] = useTestLevelBoostMutation();

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
    if (!characterId) return;
    try {
      const result = await testLevelBoost(Number(characterId)).unwrap();
      setBoostMessage(result.message);
      setTimeout(() => setBoostMessage(null), 5000);
    } catch (error: any) {
      setBoostMessage(error?.data?.message || 'Ошибка');
      setTimeout(() => setBoostMessage(null), 5000);
    }
  };

  if (!characterId) {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return <div style={styles.loadingContainer}>Загрузка...</div>;
  }

  if (error || !character) {
    return (
      <div style={styles.errorContainer}>
        Ошибка: {error ? 'error' in error ? error.error : 'Ошибка загрузки' : 'Персонаж не найден'}
        <br />
        <Link to="/">Создать персонажа</Link>
      </div>
    );
  }

  const hpPercent = (character.currentHp / character.maxHp) * 100;

  const currentStamina = staminaInfo?.currentStamina ?? character.stamina;
  const maxStamina = staminaInfo?.maxStamina ?? 100;
  const staminaPercent = (currentStamina / maxStamina) * 100; // Максимум стамины 100

  // Выбор видео героя по классу
  const getHeroVideo = () => {
    if (!character) return '';
    const classLower = character.class.toLowerCase();
    if (classLower === 'warrior') return getAssetUrl('dashboard/warrior.mp4');
    if (classLower === 'mage') return getAssetUrl('dashboard/mag.mp4');
    if (classLower === 'rogue') return getAssetUrl('dashboard/sin.mp4');
    return getAssetUrl('dashboard/warrior.mp4'); // fallback
  };

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
      <audio ref={audioRef}>
        <source src={getAssetUrl('dashboard/mainCity.mp3')} type="audio/mpeg" />
      </audio>
      <audio ref={audioRef2}>
        <source src={getAssetUrl('dashboard/mainCity.mp3')} type="audio/mpeg" />
      </audio>

      {/* Кнопки управления - верх страницы по центру */}
      <div style={{
        position: 'absolute',
        top: '20px',
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
          onClick={() => {
            localStorage.removeItem('characterId');
            navigate('/');
          }}
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

      {/* Навигационные кнопки - в ряд снизу по центру */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '2.5px',
        zIndex: 1000,
      }}>
        <Link to="/dungeon" style={{ display: 'block' }}>
          <img
            src={getAssetUrl('dashboard/dungeons.png')}
            alt="Подземелье"
            style={{
              width: '225px',
              height: '120px',
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
              width: '225px',
              height: '120px',
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
              width: '225px',
              height: '120px',
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
              width: '225px',
              height: '120px',
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
              width: '225px',
              height: '120px',
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
              width: '225px',
              height: '120px',
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

      {/* Портрет героя - центр экрана */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '340px',
        height: '340px',
        borderRadius: '10px',
        overflow: 'hidden',
        zIndex: 1000,
        pointerEvents: 'none',
      }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            console.error('Hero video failed to load');
            console.log('Video URL:', getHeroVideo());
            console.log('Character class:', character?.class);
          }}
        >
          <source src={getHeroVideo()} type="video/mp4" />
        </video>
      </div>


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

      {/* Имя, класс и уровень персонажа */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '240px',
        height: '48px',
        zIndex: 1000,
      }}>
        {/* Фоновое изображение */}
        <img
          src={getAssetUrl('dashboard/name.png')}
          alt="Character Info Background"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
            display: 'none',
          }}
        />

        {/* Контент поверх фона */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          gap: '6px',
          padding: '8px',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}>
          {/* Имя персонажа */}
          <div style={{
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '6.5px',
              color: '#d4af37',
              marginBottom: '1.5px',
              fontFamily: "'IM Fell English', serif",
              letterSpacing: '0.25px',
            }}>
              Имя
            </div>
            <div style={{
              fontSize: '10.5px',
              fontWeight: 'bold',
              color: '#ffd700',
              fontFamily: "'IM Fell English', serif",
              textShadow: '0 0 5px rgba(255, 215, 0, 0.6)',
              letterSpacing: '0.5px',
            }}>
              {character.name}
            </div>
          </div>

          {/* Класс персонажа */}
          <div style={{
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '6.5px',
              color: '#d4af37',
              marginBottom: '1.5px',
              fontFamily: "'IM Fell English', serif",
              letterSpacing: '0.25px',
            }}>
              Класс
            </div>
            <div style={{
              fontSize: '10.5px',
              fontWeight: 'bold',
              color: '#ffd700',
              fontFamily: "'IM Fell English', serif",
              textShadow: '0 0 5px rgba(255, 215, 0, 0.6)',
              letterSpacing: '0.5px',
            }}>
              {character.class}
            </div>
          </div>

          {/* Уровень персонажа */}
          <div style={{
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '6.5px',
              color: '#d4af37',
              marginBottom: '1.5px',
              fontFamily: "'IM Fell English', serif",
              letterSpacing: '0.25px',
            }}>
              Уровень
            </div>
            <div style={{
              fontSize: '10.5px',
              fontWeight: 'bold',
              color: '#ffd700',
              fontFamily: "'IM Fell English', serif",
              textShadow: '0 0 5px rgba(255, 215, 0, 0.6)',
              letterSpacing: '0.5px',
            }}>
              {character.level}
            </div>
          </div>
        </div>
      </div>

      {/* HP и Stamina бары */}
      <div style={{
        position: 'absolute',
        top: '90px',
        left: '20px',
        width: '240px',
        height: '80px',
        zIndex: 1000,
      }}>
        {/* Фоновое изображение */}
        <img
          src={getAssetUrl('dashboard/hp.png')}
          alt="Health and Stamina Background"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
            display: 'none',
          }}
        />

        {/* Контент поверх фона */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '7px',
          height: '100%',
          justifyContent: 'center',
        }}>
          {/* HP Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{
                color: '#ff6b6b',
                fontSize: '9px',
                fontWeight: 'bold',
                fontFamily: "'IM Fell English', serif",
                textShadow: '0 0 4px rgba(255, 68, 68, 0.6)',
                letterSpacing: '0.5px',
              }}>HP</span>
              <span style={{
                color: '#fff',
                fontSize: '8px',
                fontWeight: 'bold',
                fontFamily: "'IM Fell English', serif",
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
              }}>
                {character.currentHp} / {character.maxHp}
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '10px',
              background: '#1a1a1a',
              borderRadius: '5px',
              overflow: 'hidden',
              border: '1px solid #cc0000',
              boxShadow: '0 0 5px rgba(204, 0, 0, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.5)',
            }}>
              <div style={{
                width: `${hpPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #ff4444, #cc0000)',
                transition: 'width 0.3s ease',
                boxShadow: '0 0 5px rgba(255, 68, 68, 0.5)',
              }} />
            </div>
          </div>

          {/* Stamina Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{
                color: '#66bb6a',
                fontSize: '9px',
                fontWeight: 'bold',
                fontFamily: "'IM Fell English', serif",
                textShadow: '0 0 4px rgba(76, 175, 80, 0.6)',
                letterSpacing: '0.5px',
              }}>Выносливость</span>
              <span style={{
                color: '#fff',
                fontSize: '8px',
                fontWeight: 'bold',
                fontFamily: "'IM Fell English', serif",
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
              }}>
                {currentStamina} / {maxStamina}
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '10px',
              background: '#1a1a1a',
              borderRadius: '5px',
              overflow: 'hidden',
              border: '1px solid #2E7D32',
              boxShadow: '0 0 5px rgba(46, 125, 50, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.5)',
            }}>
              <div style={{
                width: `${staminaPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4CAF50, #2E7D32)',
                transition: 'width 0.3s ease',
                boxShadow: '0 0 5px rgba(76, 175, 80, 0.5)',
              }} />
            </div>
            <div style={{
              fontSize: '6.5px',
              color: '#d4af37',
              marginTop: '3px',
              fontFamily: "'IM Fell English', serif",
            }}>
              Восстанавливается: 1/сек
              {staminaInfo?.secondsToFull && staminaInfo.secondsToFull > 0 && (
                <span> • Полная через {Math.ceil(staminaInfo.secondsToFull)}с</span>
              )}
            </div>
          </div>
        </div>
      </div>

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

      {/* Объединённый блок: Золото + Характеристики */}
      <div style={{
        position: 'absolute',
        top: '200px',
        left: '20px',
        width: '240px',
        height: '128px',
        zIndex: 1000,
      }}>
        {/* Фоновое изображение */}
        <img
          src={getAssetUrl('dashboard/charaktery.png')}
          alt="Stats and Gold Background"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
            display: 'none',
          }}
        />

        {/* Контент поверх фона */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '6px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          {/* Характеристики */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}>
              <h3 style={{
                margin: 0,
                color: '#ffd700',
                fontSize: '9.5px',
                fontFamily: "'IM Fell English', serif",
                fontWeight: 700,
                textShadow: '0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)',
                letterSpacing: '1px',
              }}>
                Характеристики
              </h3>
              {character.freePoints > 0 && (
                <Link to="/levelup" style={{ textDecoration: 'none' }}>
                  <button style={{
                    padding: '3px 6.5px',
                    fontSize: '5.5px',
                    background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                    color: '#fff',
                    border: '0.5px solid #66bb6a',
                    borderRadius: '2.5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontFamily: "'IM Fell English', serif",
                    boxShadow: '0 0 5px rgba(76, 175, 80, 0.4)',
                    transition: 'all 0.3s ease',
                  }}>
                    Прокачка ({character.freePoints})
                  </button>
                </Link>
              )}
            </div>
            <div style={{
              display: 'grid',
              gap: '5px',
              color: '#fff',
              fontSize: '9px',
              fontFamily: "'IM Fell English', serif",
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
              }}>
                <span style={{ marginRight: '4px' }}>⚔️</span>
                <span>Сила:</span>
                <span style={{
                  color: '#ffd700',
                  fontWeight: 'bold',
                  marginLeft: '4px',
                  textShadow: '0 0 4px rgba(255, 215, 0, 0.6)',
                }}>{character.strength}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
              }}>
                <span style={{ marginRight: '4px' }}>🏹</span>
                <span>Ловкость:</span>
                <span style={{
                  color: '#ffd700',
                  fontWeight: 'bold',
                  marginLeft: '4px',
                  textShadow: '0 0 4px rgba(255, 215, 0, 0.6)',
                }}>{character.agility}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
              }}>
                <span style={{ marginRight: '4px' }}>🔮</span>
                <span>Интеллект:</span>
                <span style={{
                  color: '#ffd700',
                  fontWeight: 'bold',
                  marginLeft: '4px',
                  textShadow: '0 0 4px rgba(255, 215, 0, 0.6)',
                }}>{character.intelligence}</span>
              </div>
              {character.freePoints > 0 && (
                <div style={{
                  marginTop: '3px',
                  padding: '3px',
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(69, 160, 73, 0.3))',
                  borderRadius: '2.5px',
                  textAlign: 'center',
                  fontSize: '7px',
                  border: '0.5px solid rgba(76, 175, 80, 0.3)',
                  boxShadow: '0 0 5px rgba(76, 175, 80, 0.2)',
                }}>
                  Свободных очков: <span style={{
                    color: '#4CAF50',
                    fontWeight: 'bold',
                    textShadow: '0 0 4px rgba(76, 175, 80, 0.6)',
                  }}>{character.freePoints}</span>
                </div>
              )}
            </div>
          </div>

          {/* Золото */}
          <div style={{
            borderTop: '0.5px solid rgba(255, 215, 0, 0.2)',
            paddingTop: '6px',
          }}>
            <div style={{
              fontSize: '7px',
              color: '#d4af37',
              marginBottom: '3px',
              fontFamily: "'IM Fell English', serif",
              letterSpacing: '0.5px',
              textShadow: '0 0 2.5px rgba(212, 175, 55, 0.3)',
            }}>
              Золото
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              fontFamily: "'IM Fell English', serif",
              background: 'linear-gradient(135deg, #FFD700, #FFA500, #FFD700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 15px rgba(255, 215, 0, 0.5)',
              filter: 'drop-shadow(0 0 5px rgba(255, 215, 0, 0.6))',
              letterSpacing: '1px',
            }}>
              {character.gold.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      </div>

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
