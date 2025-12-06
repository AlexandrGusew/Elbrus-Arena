import { useState, useMemo, useEffect, useRef } from 'react';
import type { Zone, RoundActions, BattleState } from '../../hooks/useBattle';
import type { Character } from '../../types/api';
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


export const BattleArena = ({ character, battleState, roundHistory, onSubmitActions, onReset, fallbackDungeonId }: BattleArenaProps) => {
  const [selectedAttacks, setSelectedAttacks] = useState<Zone[]>([]);
  const [selectedDefenses, setSelectedDefenses] = useState<Zone[]>([]);
  const [waitingForResult, setWaitingForResult] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isMonsterAttacking, setIsMonsterAttacking] = useState(false);
  const [monsterInitialHp, setMonsterInitialHp] = useState<Map<number, number>>(new Map());
  const lastMonsterRef = useRef<number | undefined>(undefined);
  const [timeLeft, setTimeLeft] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Используем dungeonId из battleState, или fallback если не пришло с сервера
  const dungeonId = battleState.dungeonId || fallbackDungeonId;

  // Сбрасываем состояние при начале нового боя (когда roundNumber === 1)
  // Это работает для всех подземелий (easy, medium, hard)
  useEffect(() => {
    if (battleState.roundNumber === 1 && battleState.status === 'active') {
      setMonsterInitialHp(new Map());
      lastMonsterRef.current = undefined;
    }
  }, [battleState.roundNumber, battleState.status, dungeonId]);

  // Сохраняем начальное HP моба при первом появлении
  // Эта логика работает для всех подземелий (easy, medium, hard) и всех мобов
  useEffect(() => {
    const currentMonster = battleState.currentMonster;
    
    if (currentMonster === undefined) return;
    
    // Если это новый моб (сменился номер моба)
    if (currentMonster !== lastMonsterRef.current) {
      // Сохраняем текущее HP как начальное для нового моба
      // Когда появляется новый моб, текущее HP = начальное HP (из события round-start)
      // Но только если HP больше 0
      if (battleState.monsterHp > 0) {
        setMonsterInitialHp(prev => {
          const newMap = new Map(prev);
          newMap.set(currentMonster, battleState.monsterHp);
          return newMap;
        });
      }
      
      lastMonsterRef.current = currentMonster;
    } else if (roundHistory.length > 0) {
      // Если история есть, обновляем максимальное HP из истории
      // Это нужно на случай, если начальное HP было больше, чем мы сохранили
      const savedHp = monsterInitialHp.get(currentMonster);
      const maxHpFromHistory = Math.max(...roundHistory.map((r: any) => r.monsterHp || 0));
      
      if (maxHpFromHistory > 0 && (savedHp === undefined || maxHpFromHistory > savedHp)) {
        setMonsterInitialHp(prev => {
          const newMap = new Map(prev);
          newMap.set(currentMonster, maxHpFromHistory);
          return newMap;
        });
      }
    } else if (battleState.monsterHp > 0) {
      // Если истории нет, но текущее HP больше 0, обновляем сохраненное значение
      const savedHp = monsterInitialHp.get(currentMonster);
      if (savedHp === undefined || battleState.monsterHp > savedHp) {
        setMonsterInitialHp(prev => {
          const newMap = new Map(prev);
          newMap.set(currentMonster, battleState.monsterHp);
          return newMap;
        });
      }
    }
  }, [battleState.currentMonster, battleState.monsterHp, roundHistory]);

  // Вычисляем максимальное HP моба
  const monsterMaxHp = useMemo(() => {
    const currentMonster = battleState.currentMonster;
    
    // Сначала пытаемся получить сохраненное начальное HP для этого моба
    if (currentMonster !== undefined) {
      const savedInitialHp = monsterInitialHp.get(currentMonster);
      if (savedInitialHp !== undefined && savedInitialHp > 0) {
        return savedInitialHp;
      }
    }
    
    // Если сохраненного значения нет, используем максимальное из истории раундов
    // Это самый надежный источник, так как там всегда будет начальное HP моба (максимальное значение)
    if (roundHistory.length > 0) {
      const maxHpFromHistory = Math.max(...roundHistory.map((r: any) => r.monsterHp || 0));
      if (maxHpFromHistory > 0) {
        return maxHpFromHistory;
      }
    }
    
    // Если истории нет, используем текущее HP (но только если оно больше 0)
    // Это может быть начальное HP моба при первом появлении
    if (battleState.monsterHp > 0) {
      return battleState.monsterHp;
    }
    
    // Если все равно 0, возвращаем 1 чтобы избежать деления на 0
    return 1;
  }, [monsterInitialHp, battleState.currentMonster, battleState.monsterHp, roundHistory]);

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
      case 'warrior': return getAssetUrl('dungeon/battle/attake/atakeWar.mp4');
      case 'mage': return getAssetUrl('dungeon/battle/attake/attakeMage.mp4');
      case 'rogue': return getAssetUrl('dungeon/battle/attake/atakeRogue.mp4');
      default: return getAssetUrl('dungeon/battle/attake/atakeWar.mp4');
    }
  };

  // Выбор видео атаки моба по уровню
  const getMobAttackVideo = (mobNumber: number) => {
    switch (mobNumber) {
      case 1: return getAssetUrl('dungeon/battle/attake/dange1mob1atake.mp4');
      case 2: return getAssetUrl('dungeon/battle/attake/dange1mob2atake.mp4');
      case 4: return getAssetUrl('dungeon/battle/attake/mob4dange1atake.mp4');
      default: return getAssetUrl('dungeon/battle/attake/dange1mob1atake.mp4');
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
      // Анимация моба теперь запускается одновременно с персонажем при нажатии на кнопку атаки
    }
  }, [battleState.lastRoundResult, waitingForResult]);

  // Таймер на 1 секунду для автоматического выбора зон
  useEffect(() => {
    // Сбрасываем таймер при начале нового раунда
    if (battleState.status === 'active' && !waitingForResult) {
      setTimeLeft(1);
      
      // Очищаем предыдущий таймер если есть
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Запускаем новый таймер
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Время истекло - автоматически выбираем случайные зоны и отправляем
            const availableZones = [...ZONES];
            const shuffledAttacks = [...availableZones].sort(() => Math.random() - 0.5);
            const randomAttacks = shuffledAttacks.slice(0, 2) as [Zone, Zone];
            
            const shuffledDefenses = [...availableZones].sort(() => Math.random() - 0.5);
            const randomDefenses = shuffledDefenses.slice(0, 3) as [Zone, Zone, Zone];
            
            const actions: RoundActions = {
              attacks: randomAttacks,
              defenses: randomDefenses,
            };
            
            // Останавливаем таймер
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            
            // Запускаем анимацию атаки персонажа
            setIsAttacking(true);
            
            // Запускаем анимацию моба только для первого данжа (dungeonId === 1) и мобов с готовой анимацией (1, 2, 4)
            // Для остальных данжей и мобов (3, 5) анимация не запускается, показывается только картинка
            const currentMonster = battleState.currentMonster || 1;
            const currentDungeonId = battleState.dungeonId || dungeonId;
            if (currentDungeonId === 1 && (currentMonster === 1 || currentMonster === 2 || currentMonster === 4)) {
              setIsMonsterAttacking(true);
            }
            
            onSubmitActions(actions);
            setSelectedAttacks([]);
            setSelectedDefenses([]);
            setWaitingForResult(true);

            return 1; // Сбрасываем для следующего раунда
          }
          return prev - 1;
        });
      }, 1000);
      
      // Очистка при размонтировании или изменении зависимостей
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    } else {
      // Останавливаем таймер если бой не активен или ожидаем результат
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimeLeft(1);
    }
  }, [battleState.status, battleState.roundNumber, waitingForResult, ZONES, onSubmitActions]);

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

  const submitActions = (actions?: RoundActions) => {
    // Если действия не переданы, используем выбранные зоны
    let finalActions: RoundActions;
    
    if (actions) {
      finalActions = actions;
    } else {
      if (selectedAttacks.length !== 2 || selectedDefenses.length !== 3) {
        return;
      }
      finalActions = {
        attacks: [selectedAttacks[0], selectedAttacks[1]],
        defenses: [selectedDefenses[0], selectedDefenses[1], selectedDefenses[2]],
      };
    }

    // Останавливаем таймер
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeLeft(1);

    // Запускаем анимацию атаки персонажа
    setIsAttacking(true);
    
    // Запускаем анимацию моба только для первого данжа (dungeonId === 1) и мобов с готовой анимацией (1, 2, 4)
    // Для остальных данжей и мобов (3, 5) анимация не запускается, показывается только картинка
    const currentMonster = battleState.currentMonster || 1;
    const currentDungeonId = battleState.dungeonId || dungeonId;
    if (currentDungeonId === 1 && (currentMonster === 1 || currentMonster === 2 || currentMonster === 4)) {
      setIsMonsterAttacking(true);
    }

    onSubmitActions(finalActions);
    setSelectedAttacks([]);
    setSelectedDefenses([]);
    setWaitingForResult(true);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Фоновое изображение для боя - фиксированное */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        backgroundImage: `url(${getAssetUrl('dungeon/battle/PvE-arena.png')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }} />

      {/* Верхняя часть - прогресс подземелья - фиксированная */}
      {battleState.currentMonster && battleState.totalMonsters && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
        }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.85)',
            padding: '12px 20px',
            borderRadius: '10px',
            border: '2px solid rgba(76, 175, 80, 0.5)',
            minWidth: '250px',
            fontFamily: '"Cinzel", "MedievalSharp", "UnifrakturMaguntia", "IM Fell English", serif',
          }}>
            <div style={{ 
              color: '#4CAF50', 
              fontSize: '14px', 
              fontWeight: '600',
              marginBottom: '8px',
              textAlign: 'center',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              Прогресс подземелья
            </div>
            <div style={{ 
              marginBottom: '8px', 
              fontSize: '12px', 
              fontWeight: 'bold',
              color: '#d4af37',
              textAlign: 'center',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
              letterSpacing: '0.5px',
            }}>
              Монстр {battleState.currentMonster} / {battleState.totalMonsters}
            </div>
            <div
              style={{
                width: '100%',
                height: '14px',
                backgroundColor: '#333',
                borderRadius: '7px',
                overflow: 'hidden',
                border: '2px solid #555',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(battleState.currentMonster / battleState.totalMonsters) * 100}%`,
                  background: 'linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%)',
                  transition: 'width 0.3s ease',
                  boxShadow: '0 0 8px rgba(76, 175, 80, 0.6)',
                }}
              />
            </div>
          </div>
        </div>
      )}

        {/* Нижняя часть - 3 блока */}
        {battleState.status === 'active' ? (
          <>
            {/* Левый блок - Лог боя - фиксированный */}
            <div style={{
              position: 'fixed',
              top: 0,
              left: '15px',
              width: '300px',
              height: '100vh',
              zIndex: 1,
            }}>
              <DetailedBattleLog roundResults={roundHistory} />
            </div>

            {/* Средний блок - Персонаж, зоны атаки/защиты, моб - фиксированный */}
            <div style={{
              position: 'fixed',
              top: '140px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '600px',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              alignItems: 'center',
            }}>
              {/* Персонаж, кнопка и моб в одну строку */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                gap: '15px',
              }}>
                {/* Персонаж */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  {/* Полоска HP персонажа */}
                  <div style={{
                    width: '220px',
                    position: 'relative',
                    height: '20px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    borderRadius: '6px',
                    border: '2px solid rgba(76, 175, 80, 0.5)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${Math.max(0, Math.min(100, (battleState.playerHp / character.maxHp) * 100))}%`,
                      background: battleState.playerHp / character.maxHp > 0.5
                        ? 'linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%)'
                        : battleState.playerHp / character.maxHp > 0.25
                        ? 'linear-gradient(90deg, #FFA726 0%, #FFB74D 100%)'
                        : 'linear-gradient(90deg, #f44336 0%, #EF5350 100%)',
                      transition: 'width 0.5s ease',
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#fff',
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 1)',
                      zIndex: 2,
                    }}>
                      {battleState.playerHp} / {character.maxHp}
                    </div>
                  </div>
                  
                  <div style={{
                    width: '220px',
                    height: '220px',
                    background: '#000',
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
                      zIndex: 10,
                    }}>
                      {character.name}
                    </div>
                  </div>
                </div>

                {/* Кнопка "Атаковать" */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  {/* Таймер */}
                  {battleState.status === 'active' && !waitingForResult && (
                    <div style={{
                      background: timeLeft <= 5 
                        ? 'rgba(244, 67, 54, 0.9)' 
                        : timeLeft <= 10 
                        ? 'rgba(255, 152, 0, 0.9)' 
                        : 'rgba(0, 0, 0, 0.8)',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: `2px solid ${timeLeft <= 5 ? 'rgba(244, 67, 54, 1)' : timeLeft <= 10 ? 'rgba(255, 152, 0, 1)' : 'rgba(212, 175, 55, 0.5)'}`,
                      color: '#fff',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      minWidth: '60px',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                    }}>
                      ⏱️ {timeLeft}с
                    </div>
                  )}
                  <button
                    onClick={() => submitActions()}
                    disabled={selectedAttacks.length !== 2 || selectedDefenses.length !== 3}
                    style={{
                      width: '180px',
                      padding: '12px 20px',
                      fontSize: '16px',
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

                {/* Моб */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  {/* Полоска HP моба */}
                  <div style={{
                    width: '220px',
                    position: 'relative',
                    height: '20px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    borderRadius: '6px',
                    border: battleState.currentMonster === 5
                      ? '2px solid rgba(255, 215, 0, 0.6)'
                      : '2px solid rgba(220, 20, 60, 0.5)',
                    overflow: 'hidden',
                  }}>
                    {(() => {
                      // Используем вычисленное максимальное HP моба
                      const monsterHpPercent = monsterMaxHp > 0 
                        ? Math.max(0, Math.min(100, (battleState.monsterHp / monsterMaxHp) * 100))
                        : 0;
                      return (
                        <>
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: `${monsterHpPercent}%`,
                            background: battleState.currentMonster === 5
                              ? 'linear-gradient(90deg, #ffd700 0%, #ffed4e 100%)'
                              : 'linear-gradient(90deg, #8b0000 0%, #dc143c 100%)',
                            transition: 'width 0.5s ease',
                          }} />
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            color: '#fff',
                            textShadow: '1px 1px 2px rgba(0, 0, 0, 1)',
                            zIndex: 2,
                          }}>
                            {battleState.monsterHp} / {monsterMaxHp}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  
                  <div style={{
                    width: '220px',
                    height: '220px',
                    background: '#000',
                    border: battleState.currentMonster === 5
                      ? '2px solid rgba(255, 215, 0, 0.6)'
                      : '2px solid rgba(220, 20, 60, 0.5)',
                    borderRadius: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isMonsterAttacking
                      ? '0 0 40px rgba(220, 20, 60, 0.8)'
                      : battleState.currentMonster === 5
                      ? '0 0 30px rgba(255, 215, 0, 0.5)'
                      : '0 0 23px rgba(220, 20, 60, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Изображение моба или анимация атаки */}
                    {/* Анимация показывается только для первого данжа (dungeonId === 1) и мобов 1, 2, 4 */}
                    {(() => {
                      const currentMonster = battleState.currentMonster || 1;
                      const currentDungeonId = battleState.dungeonId || dungeonId;
                      const shouldShowAnimation = isMonsterAttacking && 
                        currentDungeonId === 1 && 
                        (currentMonster === 1 || currentMonster === 2 || currentMonster === 4);
                      
                      // ВСЕ мобы должны смотреть на персонажа (справа налево к персонажу)
                      // Поэтому отзеркаливаем всех мобов по умолчанию
                      // Исключение: первый моб в 3 данже уже перевернут в ассетах, его не отзеркаливаем
                      const needsFlip = (() => {
                        const mobNum = battleState.currentMonster || 1;
                        const dId = battleState.dungeonId || dungeonId;
                        const dungeonIdNum = typeof dId === 'number' ? dId : (dId ? parseInt(String(dId), 10) : null);
                        
                        // Первый моб в 3 данже уже перевернут в ассетах - не отзеркаливаем
                        if (dungeonIdNum === 3 && mobNum === 1) {
                          return false;
                        }
                        
                        // Все остальные мобы отзеркаливаем
                        return true;
                      })();
                      
                      const transformStyle = needsFlip ? { transform: 'scaleX(-1)' } : {};
                      
                      return shouldShowAnimation ? (
                        <video
                          key={`mob-attack-${battleState.roundNumber}`}
                          src={getMobAttackVideo(currentMonster)}
                          autoPlay
                          muted
                          playsInline
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            ...transformStyle,
                          }}
                          onEnded={() => setIsMonsterAttacking(false)}
                        />
                      ) : (
                      <img
                        src={getMobImage(battleState.currentMonster || 1, dungeonId)}
                        alt={getMobName(battleState.currentMonster || 1, dungeonId)}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 0 20px rgba(220, 20, 60, 0.6))',
                          ...transformStyle,
                        }}
                      />
                      );
                    })()}
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
                gap: '15px',
                alignItems: 'center',
                width: '100%',
              }}>
                {/* Атака */}
                <ZoneSelector
                  type="attack"
                  zones={ZONES}
                  selectedZones={selectedAttacks}
                  maxSelections={2}
                  onToggle={toggleAttack}
                  lastRoundHits={waitingForResult ? [] : lastRoundResults.playerHits}
                  lastRoundMisses={waitingForResult ? [] : lastRoundResults.playerMisses}
                />

                {/* Защита */}
                <ZoneSelector
                  type="defense"
                  zones={ZONES}
                  selectedZones={selectedDefenses}
                  maxSelections={3}
                  onToggle={toggleDefense}
                  lastRoundBlocked={waitingForResult ? [] : lastRoundResults.monsterBlocked}
                  lastRoundMisses={waitingForResult ? [] : lastRoundResults.monsterHits}
                />
              </div>
            </div>

            {/* Правый блок - Действия противника - фиксированный */}
            <div style={{
              position: 'fixed',
              top: 0,
              right: '15px',
              width: '300px',
              height: '100vh',
              zIndex: 1,
            }}>
              <EnemyActions lastRoundResult={battleState.lastRoundResult} />
            </div>
          </>
        ) : (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
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
  );
};