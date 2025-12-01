import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetCharacterQuery } from '../store/api/characterApi';
import { useGetDungeonsQuery, useStartBattleMutation } from '../store/api/battleApi';
import type { DungeonDifficulty } from '../types/api';
import { useBattle } from '../hooks/useBattle';
import { styles } from './Dungeon.styles';
import { CharacterStats } from '../components/battle/CharacterStats';
import { DifficultySelector } from '../components/battle/DifficultySelector';
import { BattleArena } from '../components/battle/BattleArena';
import { getAssetUrl } from '../utils/assetUrl';
import { ChatWindow } from '../components/ChatWindow';

const DIFFICULTY_BACKGROUNDS: Record<DungeonDifficulty, string> = {
  easy: getAssetUrl('dungeon/selection/dungeons/easy/easy_level_background.png'),
  medium: getAssetUrl('dungeon/selection/dungeons/medium/medium_level_background.png'),
  hard: getAssetUrl('dungeon/selection/dungeons/hard/hard_level_background.png'),
};

const Dungeon = () => {
  const navigate = useNavigate();
  const characterId = localStorage.getItem('characterId');

  const [selectedDifficulty, setSelectedDifficulty] = useState<DungeonDifficulty>('easy');
  const [battleId, setBattleId] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { data: character, isLoading: characterLoading } = useGetCharacterQuery(
    Number(characterId),
    { skip: !characterId }
  );

  const { data: dungeons = [], isLoading: dungeonsLoading, error: dungeonsError } = useGetDungeonsQuery();
  const [startBattleMutation] = useStartBattleMutation();

  const { battleState, roundHistory, sendRoundActions, isConnected } = useBattle(battleId);

  const selectedDungeon = dungeons.find(d => d.difficulty === selectedDifficulty);
  const requiredStamina = selectedDungeon?.staminaCost || 20;

  // Логируем загрузку подземелий для отладки
  useEffect(() => {
    console.log('📡 Dungeons API state:', {
      isLoading: dungeonsLoading,
      dungeonsCount: dungeons.length,
      dungeons: dungeons,
      error: dungeonsError,
    });
  }, [dungeons, dungeonsLoading, dungeonsError]);

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

  const startBattle = async () => {
    console.log('🎮 startBattle called');
    console.log('📋 dungeons:', dungeons);
    console.log('🎯 selectedDifficulty:', selectedDifficulty);
    console.log('🏰 selectedDungeon:', selectedDungeon);

    if (!character) return;

    if (!selectedDungeon) {
      console.error('❌ selectedDungeon is undefined!');
      alert('Выберите подземелье');
      return;
    }

    if (character.stamina < requiredStamina) {
      alert(`Недостаточно выносливости! Требуется: ${requiredStamina}, доступно: ${character.stamina}`);
      return;
    }

    try {
      console.log('🎯 Starting battle with dungeonId:', selectedDungeon.id);
      const result = await startBattleMutation({
        characterId: character.id,
        dungeonId: selectedDungeon.id,
      }).unwrap();

      console.log('✅ Battle created:', result);
      setBattleId(result.id);
    } catch (err: any) {
      alert('Ошибка при создании боя: ' + (err?.data?.message || err.message || 'Неизвестная ошибка'));
    }
  };

  const resetBattle = () => {
    setBattleId(null);
  };

  if (!characterId) {
    navigate('/');
    return null;
  }

  const loading = characterLoading || dungeonsLoading;

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
  }

  if (!character) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Персонаж не найден</div>;
  }

  if (!battleId) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Видео фон для экрана выбора */}
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
          <source src={getAssetUrl('dungeon/selection/enterDungeonBackground.mp4')} type="video/mp4" />
        </video>

        {/* Фоновая музыка */}
        <audio ref={audioRef} loop>
          <source src={getAssetUrl('dungeon/selection/enterDungeonMusic.mp3')} type="audio/mpeg" />
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
            e.currentTarget.style.filter = isMusicPlaying ? 'brightness(1)' : 'brightness(0.7)';
          }}
        >
          <img
            src={getAssetUrl('dungeon/selection/music.png')}
            alt="Music"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px',
              filter: isMusicPlaying ? 'brightness(1)' : 'brightness(0.7)',
            }}
          />
        </button>

        {/* Кнопка чата - между музыкой и выходом справа */}
        <button
          onClick={() => setIsChatOpen(true)}
          style={{
            position: 'fixed',
            top: '50%',
            right: '40px',
            transform: 'translateY(-50%)',
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
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
            e.currentTarget.style.filter = 'brightness(1.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          <img
            src={getAssetUrl('dungeon/buttonChat.png')}
            alt="Chat"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px',
            }}
          />
        </button>

        {/* Кнопка выхода - правый нижний угол */}
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <button
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
              src={getAssetUrl('dungeon/selection/exit.png')}
              alt="Exit"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          </button>
        </Link>

        {/* Контент без фона - только элементы */}
        <div style={{
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
        }}>
          {/* Выбор сложности */}
          <DifficultySelector
            selectedDifficulty={selectedDifficulty}
            onSelect={setSelectedDifficulty}
          />

          {/* Кнопка "Начать бой" заменена на изображение */}
          {character.stamina >= requiredStamina ? (
            <div
              onClick={startBattle}
              style={{
                width: '700px',
                height: '360px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 15px rgba(255, 215, 0, 0.6))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.filter = 'none';
              }}
            >
              <img
                src={getAssetUrl('dungeon/selection/enterDungeonButton.png')}
                alt="Начать бой"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  pointerEvents: 'none',
                }}
              />
            </div>
          ) : (
            <div style={{
              padding: '20px 40px',
              background: 'rgba(220, 38, 38, 0.8)',
              color: '#fff',
              fontSize: '20px',
              fontWeight: 'bold',
              borderRadius: '10px',
              textAlign: 'center',
            }}>
              Недостаточно выносливости ({requiredStamina})
            </div>
          )}
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
  }

  return (
    <>
      <BattleArena
        character={character}
        battleState={battleState}
        roundHistory={roundHistory}
        isConnected={isConnected}
        onSubmitActions={sendRoundActions}
        onReset={resetBattle}
        backgroundImage={DIFFICULTY_BACKGROUNDS[selectedDifficulty]}
        fallbackDungeonId={selectedDungeon?.id}
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
    </>
  );
};

export default Dungeon;