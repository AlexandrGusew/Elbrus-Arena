import { useState, useMemo, useEffect, useRef } from 'react';
import type { Zone, RoundActions, BattleState } from '../../hooks/useBattle';
import type { Character } from '../../types/api';
import { ZoneBlocks } from './ZoneBlocks';
import { DetailedBattleLog } from './DetailedBattleLog';
import { ChatStub } from './ChatStub';
import { styles } from '../../pages/Dungeon.styles';
import { getAssetUrl } from '../../utils/assetUrl';

// Изображения персонажей (используются в getCharacterImage)

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
  const [attackVideoKey, setAttackVideoKey] = useState(0);
  const [monsterInitialHp, setMonsterInitialHp] = useState<Map<number, number>>(new Map());
  const lastMonsterRef = useRef<number | undefined>(undefined);
  const [timeLeft, setTimeLeft] = useState<number>(15);
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
  // Для MinIO: dungeon/battle/char-atack-animation/...
  // Для локальных файлов: char-atack-animation/...
  const getAttackVideo = () => {
    const basePath = import.meta.env.VITE_USE_MINIO === 'true' 
      ? 'dungeon/battle/char-atack-animation' 
      : 'char-atack-animation';
    
    switch (character.class) {
      case 'warrior':
        return getAssetUrl(`${basePath}/warrior-atack.mp4`);
      case 'mage':
        return getAssetUrl(`${basePath}/wizzard-atack.mp4`);
      case 'rogue':
        return getAssetUrl(`${basePath}/assasin-atack.mp4`);
      default:
        return getAssetUrl(`${basePath}/warrior-atack.mp4`);
    }
  };

  // Выбор видео атаки моба по номеру и данжу
  // Для MinIO: dungeon/battle/atack-mobs-dang-*/...
  // Для локальных файлов: atack-mobs-dang-*/...
  const getMobAttackVideo = (mobNumber: number, dungeonId?: number) => {
    const currentDungeonId = dungeonId || battleState.dungeonId || 1;
    const basePath = import.meta.env.VITE_USE_MINIO === 'true' 
      ? 'dungeon/battle' 
      : '';
    
    // Данж 1 - Катакомбы
    if (currentDungeonId === 1) {
      const folder = basePath ? `${basePath}/atack-mobs-dang-1` : 'atack-mobs-dang-1';
      switch (mobNumber) {
        case 1: return getAssetUrl(`${folder}/dang1mob1.mp4`);
        case 2: return getAssetUrl(`${folder}/dang1mob2.mp4`);
        case 3: return getAssetUrl(`${folder}/dang1mob3.mp4`);
        case 4: return getAssetUrl(`${folder}/dang1mob4.mp4`);
        case 5: return getAssetUrl(`${folder}/dang1mob5.mp4`);
        default: return getAssetUrl(`${folder}/dang1mob1.mp4`);
      }
    }
    // Данж 2 - Болото
    else if (currentDungeonId === 2) {
      const folder = basePath ? `${basePath}/atack-mobs-dang-2` : 'atack-mobs-dang-2';
      switch (mobNumber) {
        case 1: return getAssetUrl(`${folder}/dange2mob1.mp4`);
        case 2: return getAssetUrl(`${folder}/dange2mob2.mp4`);
        case 3: return getAssetUrl(`${folder}/dange2mob3.mp4`);
        case 4: return getAssetUrl(`${folder}/dange2mob4.mp4`);
        case 5: return getAssetUrl(`${folder}/dange2mob5.mp4`);
        default: return getAssetUrl(`${folder}/dange2mob1.mp4`);
      }
    }
    // Данж 3
    else if (currentDungeonId === 3) {
      const folder = basePath ? `${basePath}/atack-mobs-dang-3` : 'atack-mobs-dang-3';
      switch (mobNumber) {
        case 1: return getAssetUrl(`${folder}/dange3mob1.mp4`);
        case 2: return getAssetUrl(`${folder}/dange3mob2.mp4`);
        case 3: return getAssetUrl(`${folder}/dange3mob3.mp4`);
        case 4: return getAssetUrl(`${folder}/dange3mob4.mp4`);
        case 5: return getAssetUrl(`${folder}/dange3mob5.mp4`);
        default: return getAssetUrl(`${folder}/dange3mob1.mp4`);
      }
    }
    
    // Fallback для неизвестного данжа
    const folder = basePath ? `${basePath}/atack-mobs-dang-1` : 'atack-mobs-dang-1';
    return getAssetUrl(`${folder}/dang1mob1.mp4`);
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

  // Анализ результатов последнего раунда для ZoneBlocks
  const lastRoundResults = useMemo(() => {
    if (!battleState.lastRoundResult) {
      return {
        defendedSuccessfully: [],
        notAttacked: [],
        playerHits: [], // игрок попал (монстр не защитил)
        playerMisses: [], // игрок промахнулся (монстр защитил)
        damageDealt: 0,
        damageTaken: 0,
      };
    }

    const { playerActions, monsterActions, monsterDamage, playerDamage } = battleState.lastRoundResult;

    // Для блоков защиты
    const defendedSuccessfully = playerActions.defenses.filter(zone =>
      monsterActions.attacks.includes(zone)
    );
    const notAttacked = playerActions.defenses.filter(zone =>
      !monsterActions.attacks.includes(zone)
    );

    // Для блоков атаки - показываем результаты атак ИГРОКА
    const playerHits = playerActions.attacks.filter(zone =>
      !monsterActions.defenses.includes(zone)
    );
    const playerMisses = playerActions.attacks.filter(zone =>
      monsterActions.defenses.includes(zone)
    );

    return {
      defendedSuccessfully,
      notAttacked,
      playerHits,
      playerMisses,
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

  // Таймер на 15 секунд для автоматического выбора зон
  useEffect(() => {
    // Сбрасываем таймер при начале нового раунда
    if (battleState.status === 'active' && !waitingForResult) {
      setTimeLeft(15);
      
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
            
            // Запускаем анимацию атаки персонажа и монстра одновременно
            setAttackVideoKey(prev => prev + 1); // Принудительно обновляем ключ видео для перезагрузки
            setIsAttacking(true);
            setIsMonsterAttacking(true);
            
            onSubmitActions(actions);
            setSelectedAttacks([]);
            setSelectedDefenses([]);
            setWaitingForResult(true);

            return 15; // Сбрасываем для следующего раунда
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
      setTimeLeft(15);
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
      // Требуем выбор и атак, и защит
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
    setTimeLeft(15);

    // Запускаем анимацию атаки персонажа и монстра одновременно
    setAttackVideoKey(prev => prev + 1); // Принудительно обновляем ключ видео для перезагрузки
    setIsAttacking(true);
    setIsMonsterAttacking(true);

    onSubmitActions(finalActions);
    setSelectedAttacks([]);
    setSelectedDefenses([]);
    setWaitingForResult(true);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Фоновое изображение для боя - фиксированное */}
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

      {/* Навигация - ДОБАВЛЯЕМ */}
      <div style={{
        position: 'absolute',
        top: '24px',
        right: '24px',
        zIndex: 1000,
        display: 'flex',
        gap: '8px',
      }}>
        <button
          style={{
            padding: '8px 16px',
            border: '2px solid #2C2D33',
            borderRadius: '6px',
            background: '#111215',
            color: '#E6E6E6',
            cursor: 'pointer',
            fontFamily: 'serif',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1A1B21';
            e.currentTarget.style.borderColor = '#B21E2C';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#111215';
            e.currentTarget.style.borderColor = '#2C2D33';
          }}
        >
          Music
        </button>
        <button
          style={{
            padding: '8px 16px',
            border: '2px solid #2C2D33',
            borderRadius: '6px',
            background: '#111215',
            color: '#E6E6E6',
            cursor: 'pointer',
            fontFamily: 'serif',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1A1B21';
            e.currentTarget.style.borderColor = '#B21E2C';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#111215';
            e.currentTarget.style.borderColor = '#2C2D33';
          }}
        >
          FAQ
        </button>
        <button
          onClick={onReset}
          style={{
            padding: '8px 16px',
            border: '2px solid #2C2D33',
            borderRadius: '6px',
            background: '#111215',
            color: '#E6E6E6',
            cursor: 'pointer',
            fontFamily: 'serif',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1A1B21';
            e.currentTarget.style.borderColor = '#B21E2C';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#111215';
            e.currentTarget.style.borderColor = '#2C2D33';
          }}
        >
          Back
        </button>
      </div>

      {/* Бейдж уровня сверху по центру */}
      {battleState.currentMonster && battleState.totalMonsters && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
        }}>
          <div style={{
            background: '#111215',
            padding: '8px 20px',
            borderRadius: '6px',
            border: '3px solid #2C2D33',
            fontFamily: 'serif',
            color: '#E6E6E6',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
          }}>
            LEVEL DANGE {battleState.currentMonster}/{battleState.totalMonsters}
          </div>
        </div>
      )}

      {/* Основной контент - 3 КОЛОНКИ */}
      {battleState.status === 'active' ? (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          gap: '24px',
          padding: '0 24px 24px 24px',
          zIndex: 1,
        }}>
          {/* ЛЕВАЯ КОЛОНКА - Игрок + Чат */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* ИГРОК - flex-1 чтобы занять верхнюю часть */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {/* Инфо панель */}
              <div style={{
                background: '#111215',
                border: '3px solid #2C2D33',
                borderRadius: '8px',
                padding: '8px 16px',
                fontFamily: 'serif',
                color: '#E6E6E6',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
              }}>
                CLASS: {character.class.toUpperCase()} | NAME: {character.name} | LVL: {character.level}
              </div>

              {/* HP бар */}
              <div style={{
                width: '286px', // Увеличено пропорционально квадрату персонажа
                position: 'relative',
                height: '20px',
                background: '#111215',
                borderRadius: '6px',
                border: '3px solid #2C2D33',
                overflow: 'hidden',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
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

              {/* Квадрат с персонажем */}
              <div style={{
                width: '286px', // Увеличено на 30% (220 * 1.3 = 286)
                height: '286px', // Увеличено на 30%
                background: '#000',
                border: '3px solid #2C2D33',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
                overflow: 'hidden',
                position: 'relative',
              }}>
                {isAttacking ? (
                  <video
                    key={`attack-${battleState.roundNumber}-${attackVideoKey}`}
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
                    onError={(e) => {
                      console.error('Error loading attack video:', getAttackVideo(), e);
                      setIsAttacking(false);
                    }}
                    onLoadStart={() => {
                      if (import.meta.env.DEV) {
                        console.log('[BattleArena] Attack video loading:', getAttackVideo());
                      }
                    }}
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
              </div>

              {/* Блоки защиты */}
              <ZoneBlocks
                type="defense"
                zones={ZONES}
                selectedZones={selectedDefenses}
                lastRoundResult={lastRoundResults}
                onToggle={toggleDefense}
                waitingForResult={waitingForResult}
              />
            </div>

            {/* ЧАТ внизу - фиксированная высота 240px */}
            <ChatStub />
          </div>

          {/* ЦЕНТРАЛЬНАЯ КОЛОНКА - Таймер + FIGHT (узкая) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            padding: '0 16px',
          }}>
            {/* Таймер */}
            {battleState.status === 'active' && !waitingForResult && (
              <div style={{
                background: timeLeft <= 5
                  ? 'rgba(244, 67, 54, 0.9)'
                  : timeLeft <= 10
                  ? 'rgba(255, 152, 0, 0.9)'
                  : '#111215',
                padding: '12px 20px',
                borderRadius: '8px',
                border: `3px solid ${timeLeft <= 5 ? '#f44336' : timeLeft <= 10 ? '#FF9800' : '#2C2D33'}`,
                color: '#fff',
                fontSize: '24px',
                fontWeight: 'bold',
                minWidth: '80px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                fontFamily: 'serif',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
              }}>
                ⏱ {timeLeft}с
              </div>
            )}
            {/* Кнопка FIGHT */}
            <button
              onClick={() => submitActions()}
              disabled={selectedAttacks.length !== 2 || selectedDefenses.length !== 3}
              style={{
                padding: '16px 32px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#fff',
                background: selectedAttacks.length === 2 && selectedDefenses.length === 3
                  ? '#B21E2C'
                  : '#2C2D33',
                border: '3px solid #2C2D33',
                borderRadius: '8px',
                cursor: selectedAttacks.length === 2 && selectedDefenses.length === 3 ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontFamily: 'serif',
                boxShadow: selectedAttacks.length === 2 && selectedDefenses.length === 3
                  ? 'inset 0 2px 4px rgba(0,0,0,0.6), 0 0 10px rgba(178, 30, 44, 0.5)'
                  : 'inset 0 2px 4px rgba(0,0,0,0.6)',
              }}
              onMouseEnter={(e) => {
                if (selectedAttacks.length === 2 && selectedDefenses.length === 3) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.6), 0 0 15px rgba(178, 30, 44, 0.7)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = selectedAttacks.length === 2 && selectedDefenses.length === 3
                  ? 'inset 0 2px 4px rgba(0,0,0,0.6), 0 0 10px rgba(178, 30, 44, 0.5)'
                  : 'inset 0 2px 4px rgba(0,0,0,0.6)';
              }}
            >
              ⚔️ FIGHT
            </button>
          </div>

          {/* ПРАВАЯ КОЛОНКА - Монстр + Лог боя */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* МОНСТР - flex-1 чтобы занять верхнюю часть */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {/* Инфо моба */}
              <div style={{
                background: '#111215',
                border: '3px solid #2C2D33',
                borderRadius: '8px',
                padding: '8px 16px',
                fontFamily: 'serif',
                color: '#E6E6E6',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
              }}>
                {getMobName(battleState.currentMonster || 1, dungeonId)}
              </div>

              {/* HP бар */}
              <div style={{
                width: '286px', // Увеличено пропорционально квадрату монстра
                position: 'relative',
                height: '20px',
                background: '#111215',
                borderRadius: '6px',
                border: battleState.currentMonster === 5
                  ? '3px solid rgba(255, 215, 0, 0.6)'
                  : '3px solid #2C2D33',
                overflow: 'hidden',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
              }}>
                {(() => {
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

              {/* Квадрат с монстром */}
              <div style={{
                width: '286px', // Увеличено на 30% (220 * 1.3 = 286)
                height: '286px', // Увеличено на 30%
                background: '#000',
                border: battleState.currentMonster === 5
                  ? '3px solid rgba(255, 215, 0, 0.6)'
                  : '3px solid #2C2D33',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Изображение моба или анимация атаки */}
                {(() => {
                  const currentMonster = battleState.currentMonster || 1;
                  const currentDungeonId = battleState.dungeonId || dungeonId;

                  const needsFlip = (() => {
                    const mobNum = battleState.currentMonster || 1;
                    const dId = battleState.dungeonId || dungeonId;
                    const dungeonIdNum = typeof dId === 'number' ? dId : (dId ? parseInt(String(dId), 10) : null);

                    if (dungeonIdNum === 3 && mobNum === 1) {
                      return false;
                    }
                    return true;
                  })();

                  const transformStyle = needsFlip ? { transform: 'scaleX(-1)' } : {};

                  return isMonsterAttacking ? (
                    <video
                      key={`mob-attack-${battleState.roundNumber}-${currentMonster}-${currentDungeonId}`}
                      src={getMobAttackVideo(currentMonster, currentDungeonId)}
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
              </div>

              {/* Блоки атаки */}
              <ZoneBlocks
                type="attack"
                zones={ZONES}
                selectedZones={selectedAttacks}
                lastRoundResult={lastRoundResults}
                onToggle={toggleAttack}
                waitingForResult={waitingForResult}
              />
            </div>

            {/* ЛОГ БОЯ внизу - фиксированная высота 240px */}
            <DetailedBattleLog roundResults={roundHistory} />
          </div>
        </div>
      ) : (
          <div style={{
            position: 'absolute',
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

            {/* Показываем награды и при победе, и при поражении */}
            {(battleState.status === 'won' || battleState.status === 'lost') && (
              <div style={{
                ...styles.lootContainer,
                maxWidth: '450px',
                border: battleState.status === 'won'
                  ? '2px solid #d4af37'
                  : '2px solid #8b0000',
              }}>
                <h3 style={{
                  textAlign: 'center',
                  marginBottom: '11px',
                  color: battleState.status === 'won' ? '#d4af37' : '#ff4444',
                }}>
                  {battleState.status === 'won' ? '🎉 Победа!' : '💀 Поражение'}
                </h3>

                <div style={{
                  textAlign: 'center',
                  marginBottom: '15px',
                  fontSize: '16px',
                  color: '#aaa',
                }}>
                  {battleState.status === 'won'
                    ? 'Вы успешно прошли подземелье!'
                    : 'Вы погибли, но получили награды за пройденный путь:'}
                </div>

                {(() => {
                  console.log('🎁 BattleArena: Отображение результатов боя:', {
                    status: battleState.status,
                    lootedItems: battleState.lootedItems,
                    lootedItemsLength: battleState.lootedItems?.length || 0,
                    expGained: battleState.expGained,
                    goldGained: battleState.goldGained,
                    hasLootedItems: !!battleState.lootedItems,
                    lootedItemsIsArray: Array.isArray(battleState.lootedItems),
                  });
                  return null;
                })()}

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
                    {(() => {
                      // Группируем предметы по названию, типу и уровню заточки
                      const groupedItems = battleState.lootedItems.reduce((acc, item) => {
                        // Создаем уникальный ключ для группировки
                        const key = `${item.itemName}_${item.itemType}_${item.enhancement || 0}`;
                        
                        if (!acc[key]) {
                          acc[key] = {
                            ...item,
                            quantity: 1,
                          };
                        } else {
                          acc[key].quantity += 1;
                        }
                        
                        return acc;
                      }, {} as Record<string, any>);

                      // Преобразуем объект в массив для отображения
                      const itemsArray = Object.values(groupedItems);

                      return itemsArray.map((item: any, index) => (
                        <div key={index} style={styles.lootItem}>
                          <span style={styles.lootItemName}>
                            {item.itemName}
                            {item.enhancement > 0 && <span style={styles.lootEnhancement}> +{item.enhancement}</span>}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={styles.lootItemType}>{item.itemType}</span>
                            {item.quantity > 1 && (
                              <span style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#d4af37',
                                background: 'rgba(212, 175, 55, 0.2)',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                border: '1px solid rgba(212, 175, 55, 0.5)',
                              }}>
                                × {item.quantity}
                              </span>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
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