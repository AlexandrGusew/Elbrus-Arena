import { useState, useMemo, useEffect } from 'react';
import type { Zone, RoundActions, BattleState } from '../../hooks/useBattle';
import type { Character } from '../../types/api';
import { BattleStats } from './BattleStats';
import { ZoneSelector } from './ZoneSelector';
import { DungeonProgress } from './DungeonProgress';
import { DetailedBattleLog } from './DetailedBattleLog';
import { EnemyActions } from './EnemyActions';
import { styles } from '../../pages/Dungeon.styles';

// Импортируем фон для боя
import fightBackground from '../../assets/fight/PvE-arena.png';

// Импортируем изображения персонажей
import warriorImg from '../../assets/fight/warrior_character.png';
import mageImg from '../../assets/fight/mage_character.png';
import rogueImg from '../../assets/fight/rogue_character.png';

// Импортируем статичные изображения персонажей по классам
// warriorImg, mageImg, rogueImg уже импортированы выше

// Импортируем изображения мобов для Данжа 1 (Катакомбы)
import mob1 from '../../assets/mobs/mob-1-skeleton.png';
import mob2 from '../../assets/mobs/mob-2-archer.png';
import mob3 from '../../assets/mobs/mob-3-spear.png';
import mob4 from '../../assets/mobs/mob-4-mage.png';
import mob5 from '../../assets/mobs/mob-5-boss.png';

// Импортируем изображения мобов для Данжа 2 (Болото)
import dungeon2Mob1 from '../../assets/mobs/dungeon2-mob-1-slime.png';
import dungeon2Mob2 from '../../assets/mobs/dungeon2-mob-2-crocodile.png';
import dungeon2Mob3 from '../../assets/mobs/dungeon2-mob-3-spider.png';
import dungeon2Mob4 from '../../assets/mobs/dungeon2-mob-4-monster.png';
import dungeon2Mob5 from '../../assets/mobs/dungeon2-mob-5-leshy-boss.png';

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

  // Используем dungeonId из battleState, или fallback если не пришло с сервера
  const dungeonId = battleState.dungeonId || fallbackDungeonId;

  // SHADOW_DANCER имеет 5 зон атаки (включая спину)
  const isShadowDancer = character.specialization?.branch === 'SHADOW_DANCER';
  const ZONES = isShadowDancer ? ZONES_5 : ZONES_4;

  // Выбор изображения персонажа по классу
  const getCharacterImage = () => {
    switch (character.class) {
      case 'warrior': return warriorImg;
      case 'mage': return mageImg;
      case 'rogue': return rogueImg;
      default: return warriorImg;
    }
  };

  // Получить изображение моба по номеру и dungeonId
  const getMobImage = (mobNumber: number, dungeonId?: number) => {
    // Отладка - выводим dungeonId в консоль
    console.log('🎮 getMobImage - dungeonId:', dungeonId, 'mobNumber:', mobNumber);

    // Данж 1 - Катакомбы (скелеты)
    if (dungeonId === 1 || !dungeonId) {
      const images = [mob1, mob2, mob3, mob4, mob5];
      return images[mobNumber - 1] || mob1;
    }
    // Данж 2 - Болото (слизни, крокодилы, пауки, леший)
    else if (dungeonId === 2) {
      const images = [dungeon2Mob1, dungeon2Mob2, dungeon2Mob3, dungeon2Mob4, dungeon2Mob5];
      return images[mobNumber - 1] || dungeon2Mob1;
    }
    // По умолчанию - данж 1
    return mob1;
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
        backgroundImage: `url(${fightBackground})`,
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
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px',
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
            padding: '10px 30px',
            borderRadius: '10px',
            border: '2px solid rgba(212, 175, 55, 0.4)',
          }}>
            <div style={{ color: '#d4af37', fontSize: '20px', fontWeight: 'bold' }}>
              Раунд {battleState.roundNumber} • {getStatusText()}
            </div>
          </div>
        </div>

        {/* Нижняя часть - 3 блока */}
        {battleState.status === 'active' ? (
          <div style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '350px 1fr 350px',
            gap: '20px',
            padding: '0 20px 20px 20px',
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
              gap: '10px',
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
                    width: '280px',
                    height: '280px',
                    background: 'rgba(76, 175, 80, 0.1)',
                    border: '3px solid rgba(76, 175, 80, 0.5)',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(76, 175, 80, 0.3)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <img
                      src={getCharacterImage()}
                      alt={character.class}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(0, 0, 0, 0.8)',
                      color: '#4CAF50',
                      padding: '5px 15px',
                      borderRadius: '8px',
                      fontSize: '14px',
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
                    width: '280px',
                    height: '280px',
                    background: 'rgba(220, 20, 60, 0.1)',
                    border: battleState.currentMonster === 5
                      ? '3px solid rgba(255, 215, 0, 0.6)'
                      : '3px solid rgba(220, 20, 60, 0.5)',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: battleState.currentMonster === 5
                      ? '0 0 40px rgba(255, 215, 0, 0.5)'
                      : '0 0 30px rgba(220, 20, 60, 0.3)',
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
                        transform: 'scaleX(-1)', // Отзеркаливаем моба, чтобы смотрел влево
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(0, 0, 0, 0.8)',
                      color: battleState.currentMonster === 5 ? '#ffd700' : '#dc143c',
                      padding: '5px 15px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      border: `2px solid ${battleState.currentMonster === 5 ? 'rgba(255, 215, 0, 0.5)' : 'rgba(220, 20, 60, 0.5)'}`,
                      boxShadow: battleState.currentMonster === 5 ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none',
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
                gap: '10px',
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
                    width: '300px',
                    padding: '12px 30px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#fff',
                    background: selectedAttacks.length === 2 && selectedDefenses.length === 3
                      ? 'linear-gradient(135deg, #8b2c2f 0%, #dc143c 100%)'
                      : '#555',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: selectedAttacks.length === 2 && selectedDefenses.length === 3 ? 'pointer' : 'not-allowed',
                    boxShadow: selectedAttacks.length === 2 && selectedDefenses.length === 3
                      ? '0 4px 15px rgba(220, 20, 60, 0.4)'
                      : 'none',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
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
            gap: '20px',
          }}>
            <div style={{ textAlign: 'center', fontSize: '64px' }}>
              {battleState.status === 'won' ? '🎉' : '💀'}
            </div>

            {battleState.status === 'won' && (
              <div style={{
                ...styles.lootContainer,
                maxWidth: '600px',
              }}>
                <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>🎁 Награды</h3>

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
                padding: '15px 40px',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#fff',
                background: 'linear-gradient(135deg, #4a4a4a 0%, #6a6a6a 100%)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
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