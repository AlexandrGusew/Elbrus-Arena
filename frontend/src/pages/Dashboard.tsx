import { Link, useNavigate } from 'react-router-dom';
import { useGetCharacterQuery, useGetStaminaInfoQuery, useTestLevelBoostMutation } from '../store/api/characterApi';
import { styles } from './Dashboard.styles';
import { useState, useEffect, useRef } from 'react';
import { getAssetUrl } from '../utils/assetUrl';

const Dashboard = () => {
  const navigate = useNavigate();
  const characterId = localStorage.getItem('characterId');
  const [boostMessage, setBoostMessage] = useState<string | null>(null);

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

  // Выбор изображения героя по классу
  const getHeroImage = () => {
    const classLower = character.class.toLowerCase();
    if (classLower === 'warrior') return getAssetUrl('createCharacter/warrior (1).png');
    if (classLower === 'mage') return getAssetUrl('createCharacter/mage (1).png');
    if (classLower === 'rogue') return getAssetUrl('createCharacter/rogue (1).png');
    return getAssetUrl('createCharacter/warrior (1).png'); // fallback
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
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
        <source src={getAssetUrl('dashboard/mainCityBackground.mp4')} type="video/mp4" />
      </video>

      {/* Фоновая музыка - два трека для crossfade */}
      <audio ref={audioRef}>
        <source src={getAssetUrl('dashboard/mainCity.mp3')} type="audio/mpeg" />
      </audio>
      <audio ref={audioRef2}>
        <source src={getAssetUrl('dashboard/mainCity.mp3')} type="audio/mpeg" />
      </audio>

      {/* Кнопка музыки - правый верхний угол */}
      <button
        onClick={toggleMusic}
        style={{
          position: 'fixed',
          top: '40px',
          right: '40px',
          padding: '0',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          width: '200px',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
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
            borderRadius: '8px',
          }}
        />
      </button>

      {/* Кнопка выхода - правый нижний угол */}
      <button
        onClick={() => {
          localStorage.removeItem('characterId');
          navigate('/');
        }}
        style={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
          padding: '0',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          width: '200px',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
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
            borderRadius: '8px',
          }}
        />
      </button>

      <div style={{
        display: 'none',
      }}>

        {/* Кнопка теста */}
        <button
          onClick={handleLevelBoost}
          disabled={isBoostLoading}
          style={{
            padding: '10px',
            border: '2px solid #fff',
            background: isBoostLoading ? 'rgba(128, 128, 128, 0.8)' : 'rgba(255, 152, 0, 0.8)',
            color: '#fff',
            fontSize: '20px',
            cursor: isBoostLoading ? 'not-allowed' : 'pointer',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            width: '50px',
            height: '50px',
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
        position: 'fixed',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '5px',
        zIndex: 1000,
      }}>
        <Link to="/dungeon" style={{ display: 'block' }}>
          <img
            src={getAssetUrl('dashboard/dungeons.png')}
            alt="Подземелье"
            style={{
              width: '450px',
              height: '240px',
              objectFit: 'cover',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'transparent',
              borderRadius: '8px',
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
              width: '450px',
              height: '240px',
              objectFit: 'cover',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'transparent',
              borderRadius: '8px',
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
              width: '450px',
              height: '240px',
              objectFit: 'cover',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'transparent',
              borderRadius: '8px',
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
              width: '450px',
              height: '240px',
              objectFit: 'cover',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'transparent',
              borderRadius: '8px',
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
              width: '450px',
              height: '240px',
              objectFit: 'cover',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'transparent',
              borderRadius: '8px',
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
              width: '450px',
              height: '240px',
              objectFit: 'cover',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'transparent',
              borderRadius: '8px',
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
        position: 'fixed',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '450px',
        height: '600px',
        borderRadius: '20px',
        overflow: 'hidden',
        zIndex: 1000,
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.9)',
      }}>
        <img
          src={getHeroImage()}
          alt={character.class}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>


      {/* Кнопка Level Up - появляется только когда есть свободные очки */}
      {character.freePoints > 0 && (
        <Link to="/inventory" style={{
          position: 'fixed',
          top: '285px', // Сразу под портретом
          left: '40px',
          width: '150px',
          height: '60px',
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
              borderRadius: '8px',
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
        position: 'fixed',
        top: '40px',
        left: '40px',
        display: 'flex',
        gap: '10px',
        zIndex: 1000,
      }}>
        {/* Имя персонажа */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '8px 15px',
          borderRadius: '8px',
          border: '2px solid #ffd700',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        }}>
          <div style={{
            fontSize: '11px',
            color: '#aaa',
            marginBottom: '2px',
          }}>
            Имя
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#ffd700',
          }}>
            {character.name}
          </div>
        </div>

        {/* Класс персонажа */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '8px 15px',
          borderRadius: '8px',
          border: '2px solid #ffd700',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        }}>
          <div style={{
            fontSize: '11px',
            color: '#aaa',
            marginBottom: '2px',
          }}>
            Класс
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#ffd700',
          }}>
            {character.class}
          </div>
        </div>

        {/* Уровень персонажа */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '8px 15px',
          borderRadius: '8px',
          border: '2px solid #ffd700',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        }}>
          <div style={{
            fontSize: '11px',
            color: '#aaa',
            marginBottom: '2px',
          }}>
            Уровень
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#ffd700',
          }}>
            {character.level}
          </div>
        </div>
      </div>

      {/* HP и Stamina бары */}
      <div style={{
        position: 'fixed',
        top: '125px',
        left: '40px',
        width: '300px',
        zIndex: 1000,
      }}>
        {/* HP Bar */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '10px 15px',
          borderRadius: '8px',
          border: '2px solid #ffd700',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          marginBottom: '10px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>HP</span>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
              {character.currentHp} / {character.maxHp}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '20px',
            background: '#333',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #555',
          }}>
            <div style={{
              width: `${hpPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ff4444, #cc0000)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Stamina Bar */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '10px 15px',
          borderRadius: '8px',
          border: '2px solid #ffd700',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>Выносливость</span>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
              {currentStamina} / {maxStamina}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '20px',
            background: '#333',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #555',
          }}>
            <div style={{
              width: `${staminaPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4CAF50, #2E7D32)',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '5px' }}>
            Восстанавливается: 1/сек
            {staminaInfo?.secondsToFull && staminaInfo.secondsToFull > 0 && (
              <span> • Полная через {Math.ceil(staminaInfo.secondsToFull)}с</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ ...styles.container, position: 'relative', zIndex: 2, height: '100vh', overflowY: 'auto' }}>
      {boostMessage && (
        <div style={{
          marginTop: '10px',
          marginBottom: '20px',
          padding: '10px',
          background: '#4caf50',
          borderRadius: '4px',
          fontSize: '14px',
          textAlign: 'center',
        }}>
          {boostMessage}
        </div>
      )}

      {/* Объединённый блок: Золото + Характеристики */}
      <div style={{
        position: 'fixed',
        top: '330px',
        left: '40px',
        width: '300px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '8px',
        border: '2px solid #ffd700',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
      }}>
        {/* Золото */}
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: '1px solid #ffd700',
        }}>
          <div style={{
            fontSize: '14px',
            color: '#aaa',
            marginBottom: '5px',
          }}>
            Золото
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#FFD700',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
          }}>
            {character.gold.toLocaleString()}
          </div>
        </div>

        {/* Характеристики */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <h3 style={{
              margin: 0,
              color: '#ffd700',
              fontSize: '16px',
            }}>
              Характеристики
            </h3>
            {character.freePoints > 0 && (
              <Link to="/levelup" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '4px 12px',
                  fontSize: '11px',
                  background: '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}>
                  Прокачка ({character.freePoints})
                </button>
              </Link>
            )}
          </div>
          <div style={{
            display: 'grid',
            gap: '8px',
            color: '#fff',
            fontSize: '14px',
          }}>
            <div>Сила: <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{character.strength}</span></div>
            <div>Ловкость: <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{character.agility}</span></div>
            <div>Интеллект: <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{character.intelligence}</span></div>
            {character.freePoints > 0 && (
              <div style={{
                marginTop: '4px',
                padding: '6px',
                background: 'rgba(76, 175, 80, 0.2)',
                borderRadius: '4px',
                textAlign: 'center',
              }}>
                Свободных очков: <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{character.freePoints}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      </div>
    </div>
  );
};

export default Dashboard;
