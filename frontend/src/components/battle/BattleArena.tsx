import { useState, useMemo, useEffect, useRef } from 'react';
import type { Zone, RoundActions, BattleState } from '../../hooks/useBattle';
import type { Character } from '../../types/api';
import { BattleStats } from './BattleStats';
import { ZoneSelector } from './ZoneSelector';
import { DungeonProgress } from './DungeonProgress';
import { DetailedBattleLog } from './DetailedBattleLog';
import { EnemyActions } from './EnemyActions';
import { styles } from '../../pages/Dungeon.styles';
import { getAssetUrl } from '../../utils/assetUrl';

// Изображения для боя
const fightBackground = getAssetUrl('dungeon/battle/PvE-arena.png');

// Изображения персонажей
const warriorImg = getAssetUrl('dungeon/battle/warrior_character.png');
const mageImg = getAssetUrl('dungeon/battle/mage_character.png');
const rogueImg = getAssetUrl('dungeon/battle/rogue_character.png');

// Изображения мобов для Данжа 1 (Катакомбы)
const mob1 = getAssetUrl('dungeon/mobs/mob-1-skeleton.png');
const mob2 = getAssetUrl('dungeon/mobs/mob-2-archer.png');
const mob3 = getAssetUrl('dungeon/mobs/mob-3-spear.png');
const mob4 = getAssetUrl('dungeon/mobs/mob-4-mage.png');
const mob5 = getAssetUrl('dungeon/mobs/mob-5-boss.png');

// Изображения мобов для Данжа 2 (Болото)
const dungeon2Mob1 = getAssetUrl('dungeon/mobs/dungeon2-mob-1-slime.png');
const dungeon2Mob2 = getAssetUrl('dungeon/mobs/dungeon2-mob-2-crocodile.png');
const dungeon2Mob3 = getAssetUrl('dungeon/mobs/dungeon2-mob-3-spider.png');
const dungeon2Mob4 = getAssetUrl('dungeon/mobs/dungeon2-mob-4-monster.png');
const dungeon2Mob5 = getAssetUrl('dungeon/mobs/dungeon2-mob-5-leshy-boss.png');

// Изображения мобов для Данжа 3
const dungeon3Mob1 = getAssetUrl('dungeon/mobs/dange3mob1.png');
const dungeon3Mob2 = getAssetUrl('dungeon/mobs/dange3mob2.png');
const dungeon3Mob3 = getAssetUrl('dungeon/mobs/dange3mob3.png');
const dungeon3Mob4 = getAssetUrl('dungeon/mobs/dange3mob4.png');
const dungeon3Mob5 = getAssetUrl('dungeon/mobs/dange3mob5.png');

type BattleArenaProps = {
  character: Character;
  battleState: BattleState;
  roundHistory: any[];
  isConnected: boolean;
  onSubmitActions: (actions: RoundActions) => void;
  onReset: () => void;
  backgroundImage?: string;
  fallbackDungeonId?: number; // Fallback dungeonId на случай если не пришло с сервера
};

const ZONES_4: Zone[] = ['head', 'body', 'legs', 'arms'];
const ZONES_5: Zone[] = ['head', 'body', 'legs', 'arms', 'back'];

// Компонент для удаления зеленого фона (chroma key)
const ChromaKeyVideo = ({ src, onEnded, style }: { src: string; onEnded: () => void; style: React.CSSProperties }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let isPlaying = false;

    const drawFrame = () => {
      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        // Устанавливаем размер canvas только один раз
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        ctx.drawImage(video, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Удаляем яркий зеленый фон (chroma key)
        // Более точная проверка для яркого зеленого (RGB примерно 0, 255, 0)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Проверяем яркий зеленый цвет (хромакей)
          // Зеленый должен быть доминирующим и ярким
          const isGreen = g > 150 && g > r + 50 && g > b + 50;
          
          if (isGreen) {
            data[i + 3] = 0; // Делаем пиксель прозрачным
          }
        }

        ctx.putImageData(imageData, 0, 0);
      }

      if (isPlaying && !video.ended && !video.paused) {
        animationFrameRef.current = requestAnimationFrame(drawFrame);
      } else if (video.ended) {
        onEnded();
      }
    };

    const handlePlay = () => {
      isPlaying = true;
      drawFrame();
    };

    const handlePause = () => {
      isPlaying = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    const handleEnded = () => {
      isPlaying = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      onEnded();
    };

    const handleLoadedMetadata = () => {
      if (video.readyState >= 2) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Запускаем отрисовку если видео уже играет
    if (video.readyState >= 2 && !video.paused && !video.ended) {
      handlePlay();
    }

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [src, onEnded]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        playsInline
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        style={{
          ...style,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

export const BattleArena = ({ character, battleState, roundHistory, onSubmitActions, onReset, fallbackDungeonId }: BattleArenaProps) => {
  const [selectedAttacks, setSelectedAttacks] = useState<Zone[]>([]);
  const [selectedDefenses, setSelectedDefenses] = useState<Zone[]>([]);
  const [waitingForResult, setWaitingForResult] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);

  // Используем dungeonId из battleState, или fallback если не пришло с сервера
  const dungeonId = battleState.dungeonId || fallbackDungeonId;

  // SHADOW_DANCER имеет 5 зон атаки (включая спину)
  const isShadowDancer = character.specialization?.branch === 'SHADOW_DANCER';
  const ZONES = isShadowDancer ? ZONES_5 : ZONES_4;

  // Выбор изображения персонажа по классу
  const getCharacterImage = () => {
    switch (character.class) {
      case 'warrior': return getAssetUrl('dungeon/battle/warrior_character.png');
      case 'mage': return getAssetUrl('dungeon/battle/mage_character.png');
      case 'rogue': return getAssetUrl('dungeon/battle/rogue_character.png');
      default: return getAssetUrl('dungeon/battle/warrior_character.png');
    }
  };

  // Выбор видео атаки персонажа по классу
  const getAttackVideo = () => {
    switch (character.class) {
      case 'warrior': return getAssetUrl('dungeon/battle/atakeWar.mp4');
      case 'mage': return getAssetUrl('dungeon/battle/attakeMage.mp4');
      case 'rogue': return getAssetUrl('dungeon/battle/atakeRogue.mp4');
      default: return getAssetUrl('dungeon/battle/atakeWar.mp4');
    }
  };

  // Получить изображение моба по номеру и dungeonId
  const getMobImage = (mobNumber: number, dungeonId?: number) => {
    // Отладка - выводим dungeonId в консоль
    console.log('🎮 getMobImage - dungeonId:', dungeonId, 'mobNumber:', mobNumber);

    // Данж 1 - Катакомбы (скелеты)
    if (dungeonId === 1 || !dungeonId) {
      const images = [
        getAssetUrl('dungeon/mobs/mob-1-skeleton.png'),
        getAssetUrl('dungeon/mobs/mob-2-archer.png'),
        getAssetUrl('dungeon/mobs/mob-3-spear.png'),
        getAssetUrl('dungeon/mobs/mob-4-mage.png'),
        getAssetUrl('dungeon/mobs/mob-5-boss.png'),
      ];
      return images[mobNumber - 1] || images[0];
    }
    // Данж 2 - Болото (слизни, крокодилы, пауки, леший)
    else if (dungeonId === 2) {
      const images = [
        getAssetUrl('dungeon/mobs/dungeon2-mob-1-slime.png'),
        getAssetUrl('dungeon/mobs/dungeon2-mob-2-crocodile.png'),
        getAssetUrl('dungeon/mobs/dungeon2-mob-3-spider.png'),
        getAssetUrl('dungeon/mobs/dungeon2-mob-4-monster.png'),
        getAssetUrl('dungeon/mobs/dungeon2-mob-5-leshy-boss.png'),
      ];
      return images[mobNumber - 1] || images[0];
    }
    // Данж 3
    else if (dungeonId === 3) {
      const images = [
        getAssetUrl('dungeon/mobs/dange3mob1.png'),
        getAssetUrl('dungeon/mobs/dange3mob2.png'),
        getAssetUrl('dungeon/mobs/dange3mob3.png'),
        getAssetUrl('dungeon/mobs/dange3mob4.png'),
        getAssetUrl('dungeon/mobs/dange3mob5.png'),
      ];
      return images[mobNumber - 1] || images[0];
    }
    // По умолчанию - данж 1
    return getAssetUrl('dungeon/mobs/mob-1-skeleton.png');
  };

  // Названия мобов
  const getMobName = (mobNumber: number, dungeonId?: number) => {
    // Данж 1 - Катакомбы
    if (dungeonId === 1 || !dungeonId) {
      const names = ['Скелет-Воин', 'Скелет-Лучник', 'Скелет-Копейщик', 'Скелет-Маг', '💀 ГЕНЕРАЛ-СКЕЛЕТ'];
      return names[mobNumber - 1] || 'Монстр';
    }
    // Данж 2 - Болото
    else if (dungeonId === 2) {
      const names = ['Слизь', 'Болотный Крокодил', 'Паук', 'Болотный Монстр', '🌿 ЛЕШИЙ-БОСС'];
      return names[mobNumber - 1] || 'Монстр';
    }
    // Данж 3
    else if (dungeonId === 3) {
      const names = ['Темный Воин', 'Теневой Маг', 'Демон-Страж', 'Повелитель Тьмы', '🔥 ВЛАСТЕЛИН ПОДЗЕМЕЛЬЯ'];
      return names[mobNumber - 1] || 'Монстр';
    }
    return 'Монстр';
  };

  // Анализ результатов последнего раунда
  const lastRoundResults = useMemo(() => {
    if (!battleState.lastRoundResult) {
      return {
        playerHits: [],
        playerMisses: [],
        monsterBlocked: [],
        monsterHits: [],
        damageDealt: 0,
        damageTaken: 0,
      };
    }

    const { playerActions, monsterActions, monsterDamage, playerDamage } = battleState.lastRoundResult;

    const playerHits = playerActions.attacks.filter(zone => !monsterActions.defenses.includes(zone));
    const playerMisses = playerActions.attacks.filter(zone => monsterActions.defenses.includes(zone));
    const monsterBlocked = playerActions.defenses.filter(zone => monsterActions.attacks.includes(zone));
    const monsterHits = monsterActions.attacks.filter(zone => !playerActions.defenses.includes(zone));

    return {
      playerHits,
      playerMisses,
      monsterBlocked,
      monsterHits,
      damageDealt: monsterDamage,
      damageTaken: playerDamage,
    };
  }, [battleState.lastRoundResult]);

  // Сбрасываем состояние ожидания когда приходит новый результат
  useEffect(() => {
    if (battleState.lastRoundResult && waitingForResult) {
      setWaitingForResult(false);
    }
  }, [battleState.lastRoundResult, waitingForResult]);

  const toggleAttack = (zone: Zone) => {
    if (selectedAttacks.includes(zone)) {
      setSelectedAttacks(selectedAttacks.filter(z => z !== zone));
    } else if (selectedAttacks.length < 2) {
      setSelectedAttacks([...selectedAttacks, zone]);
    }
  };

  const toggleDefense = (zone: Zone) => {
    if (selectedDefenses.includes(zone)) {
      setSelectedDefenses(selectedDefenses.filter(z => z !== zone));
    } else if (selectedDefenses.length < 3) {
      setSelectedDefenses([...selectedDefenses, zone]);
    }
  };

  const submitActions = () => {
    if (selectedAttacks.length !== 2 || selectedDefenses.length !== 3) {
      return;
    }

    const actions: RoundActions = {
      attacks: [selectedAttacks[0], selectedAttacks[1]],
      defenses: [selectedDefenses[0], selectedDefenses[1], selectedDefenses[2]],
    };

    // Запускаем анимацию атаки на 6 секунд
    setIsAttacking(true);
    setTimeout(() => {
      setIsAttacking(false);
    }, 6000);

    onSubmitActions(actions);
    setSelectedAttacks([]);
    setSelectedDefenses([]);
    setWaitingForResult(true);
  };

  const getStatusText = () => {
    switch (battleState.status) {
      case 'active': return 'В бою';
      case 'won': return 'Победа!';
      case 'lost': return 'Поражение';
      default: return 'Ожидание...';
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Фоновое изображение для боя */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        backgroundImage: `url(${getAssetUrl('dungeon/battle/PvE-arena.png')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Верхняя часть - прогресс подземелья и статы */}
        <div style={{
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '11px',
        }}>
          {battleState.currentMonster && battleState.totalMonsters && (
            <DungeonProgress
              currentMonster={battleState.currentMonster}
              totalMonsters={battleState.totalMonsters}
            />
          )}

          <BattleStats playerHp={battleState.playerHp} monsterHp={battleState.monsterHp} />

          <div style={{
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '8px 23px',
            borderRadius: '8px',
            border: '2px solid rgba(212, 175, 55, 0.4)',
          }}>
            <div style={{ color: '#d4af37', fontSize: '15px', fontWeight: 'bold' }}>
              Раунд {battleState.roundNumber} • {getStatusText()}
            </div>
          </div>
        </div>

        {/* Нижняя часть - 3 блока */}
        {battleState.status === 'active' ? (
          <div style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '263px 1fr 263px',
            gap: '15px',
            padding: '0 15px 15px 15px',
            minHeight: 0,
          }}>
            {/* Левый блок - Лог боя */}
            <div style={{ minHeight: 0 }}>
              <DetailedBattleLog roundResults={roundHistory} />
            </div>

            {/* Средний блок - Персонаж, зоны атаки/защиты, моб */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                {/* Верхняя часть - персонаж и моб */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  flex: 1,
                  minHeight: 0,
                }}>
                  {/* Персонаж */}
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <div style={{
                      width: '210px',
                      height: '210px',
                      background: 'rgba(76, 175, 80, 0.1)',
                      border: '2px solid rgba(76, 175, 80, 0.5)',
                      borderRadius: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 23px rgba(76, 175, 80, 0.3)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                    {isAttacking ? (
                      <video
                        key={`attack-${battleState.roundNumber}`}
                        src={getAttackVideo()}
                        autoPlay
                        muted
                        playsInline
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          mixBlendMode: 'multiply', // Убирает зеленый фон
                        }}
                        onEnded={() => setIsAttacking(false)}
                      />
                    ) : (
                      <img
                        src={getCharacterImage()}
                        alt={character.class}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    )}
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(0, 0, 0, 0.8)',
                      color: '#4CAF50',
                      padding: '4px 11px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      border: '2px solid rgba(76, 175, 80, 0.5)',
                    }}>
                      {character.name}
                    </div>
                  </div>
                </div>

                {/* Моб */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <div style={{
                    width: '210px',
                    height: '210px',
                    background: 'rgba(220, 20, 60, 0.1)',
                    border: battleState.currentMonster === 5
                      ? '2px solid rgba(255, 215, 0, 0.6)'
                      : '2px solid rgba(220, 20, 60, 0.5)',
                    borderRadius: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: battleState.currentMonster === 5
                      ? '0 0 30px rgba(255, 215, 0, 0.5)'
                      : '0 0 23px rgba(220, 20, 60, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Изображение моба */}
                    <img
                      src={getMobImage(battleState.currentMonster || 1, dungeonId)}
                      alt={getMobName(battleState.currentMonster || 1, dungeonId)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 0 20px rgba(220, 20, 60, 0.6))',
                        transform: 'scaleX(-1)', // Отзеркаливаем всех мобов, чтобы смотрели влево (включая 3-е подземелье)
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(0, 0, 0, 0.8)',
                      color: battleState.currentMonster === 5 ? '#ffd700' : '#dc143c',
                      padding: '4px 11px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      border: `2px solid ${battleState.currentMonster === 5 ? 'rgba(255, 215, 0, 0.5)' : 'rgba(220, 20, 60, 0.5)'}`,
                      boxShadow: battleState.currentMonster === 5 ? '0 0 8px rgba(255, 215, 0, 0.5)' : 'none',
                    }}>
                      {getMobName(battleState.currentMonster || 1, dungeonId)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Зоны атаки и защиты */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                alignItems: 'center',
                width: '100%',
              }}>
                <ZoneSelector
                  type="attack"
                  zones={ZONES}
                  selectedZones={selectedAttacks}
                  maxSelections={2}
                  onToggle={toggleAttack}
                  lastRoundHits={waitingForResult ? [] : lastRoundResults.playerHits}
                  lastRoundMisses={waitingForResult ? [] : lastRoundResults.playerMisses}
                />

                <ZoneSelector
                  type="defense"
                  zones={ZONES}
                  selectedZones={selectedDefenses}
                  maxSelections={3}
                  onToggle={toggleDefense}
                  lastRoundBlocked={waitingForResult ? [] : lastRoundResults.monsterBlocked}
                  lastRoundMisses={waitingForResult ? [] : lastRoundResults.monsterHits}
                />

                <button
                  onClick={submitActions}
                  disabled={selectedAttacks.length !== 2 || selectedDefenses.length !== 3}
                  style={{
                    width: '225px',
                    padding: '9px 23px',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    color: '#fff',
                    background: selectedAttacks.length === 2 && selectedDefenses.length === 3
                      ? 'linear-gradient(135deg, #8b2c2f 0%, #dc143c 100%)'
                      : '#555',
                    border: 'none',
                    borderRadius: '9px',
                    cursor: selectedAttacks.length === 2 && selectedDefenses.length === 3 ? 'pointer' : 'not-allowed',
                    boxShadow: selectedAttacks.length === 2 && selectedDefenses.length === 3
                      ? '0 3px 11px rgba(220, 20, 60, 0.4)'
                      : 'none',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedAttacks.length === 2 && selectedDefenses.length === 3) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 20, 60, 0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = selectedAttacks.length === 2 && selectedDefenses.length === 3
                      ? '0 4px 15px rgba(220, 20, 60, 0.4)'
                      : 'none';
                  }}
                >
                  ⚔️ Атаковать!
                </button>
              </div>
            </div>

            {/* Правый блок - Действия противника */}
            <div style={{ minHeight: 0 }}>
              <EnemyActions lastRoundResult={battleState.lastRoundResult} />
            </div>
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
          }}>
            <div style={{ textAlign: 'center', fontSize: '48px' }}>
              {battleState.status === 'won' ? '🎉' : '💀'}
            </div>

            {battleState.status === 'won' && (
              <div style={{
                ...styles.lootContainer,
                maxWidth: '450px',
              }}>
                <h3 style={{ textAlign: 'center', marginBottom: '11px' }}>🎁 Награды</h3>

                {battleState.expGained && battleState.expGained > 0 && (
                  <div style={styles.rewardItem}>
                    ⭐ Опыт: <span style={styles.rewardValue}>+{battleState.expGained}</span>
                  </div>
                )}

                {battleState.goldGained && battleState.goldGained > 0 && (
                  <div style={styles.rewardItem}>
                    💰 Золото: <span style={styles.rewardValue}>+{battleState.goldGained}</span>
                  </div>
                )}

                {battleState.lootedItems && battleState.lootedItems.length > 0 && (
                  <div style={styles.lootSection}>
                    <h4 style={{ marginBottom: '10px' }}>Выпали предметы:</h4>
                    {battleState.lootedItems.map((item, index) => (
                      <div key={index} style={styles.lootItem}>
                        <span style={styles.lootItemName}>
                          {item.itemName}
                          {item.enhancement > 0 && <span style={styles.lootEnhancement}> +{item.enhancement}</span>}
                        </span>
                        <span style={styles.lootItemType}>{item.itemType}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onReset}
              style={{
                padding: '11px 30px',
                fontSize: '15px',
                fontWeight: 'bold',
                color: '#fff',
                background: 'linear-gradient(135deg, #4a4a4a 0%, #6a6a6a 100%)',
                border: 'none',
                borderRadius: '9px',
                cursor: 'pointer',
                boxShadow: '0 3px 11px rgba(0, 0, 0, 0.4)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Вернуться к выбору подземелья
            </button>
          </div>
        )}
      </div>
    </div>
  );
};