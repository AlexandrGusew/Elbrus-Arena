import { useState, useMemo } from 'react';
import type { Zone, RoundActions, BattleState } from '../../hooks/useBattle';
import type { Character } from '../../types/api';
import { BattleStats } from './BattleStats';
import { ZoneSelector } from './ZoneSelector';
import { DungeonProgress } from './DungeonProgress';
import { styles } from '../../pages/Dungeon.styles';

type BattleArenaProps = {
  character: Character;
  battleState: BattleState;
  isConnected: boolean;
  onSubmitActions: (actions: RoundActions) => void;
  onReset: () => void;
};

const ZONES_4: Zone[] = ['head', 'body', 'legs', 'arms'];
const ZONES_5: Zone[] = ['head', 'body', 'legs', 'arms', 'back'];

export const BattleArena = ({ character, battleState, isConnected, onSubmitActions, onReset }: BattleArenaProps) => {
  const [selectedAttacks, setSelectedAttacks] = useState<Zone[]>([]);
  const [selectedDefenses, setSelectedDefenses] = useState<Zone[]>([]);

  // SHADOW_DANCER имеет 5 зон атаки (включая спину)
  const isShadowDancer = character.specialization?.branch === 'SHADOW_DANCER';
  const ZONES = isShadowDancer ? ZONES_5 : ZONES_4;

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
    <div style={styles.container}>

      {battleState.currentMonster && battleState.totalMonsters && (
        <DungeonProgress
          currentMonster={battleState.currentMonster}
          totalMonsters={battleState.totalMonsters}
        />
      )}

      <BattleStats playerHp={battleState.playerHp} monsterHp={battleState.monsterHp} />

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3>Раунд {battleState.roundNumber}</h3>
        <div>Статус: {getStatusText()}</div>
        {battleState.lastRoundResult && (
          <div style={{ marginTop: '10px', fontSize: '14px' }}>
            <span style={{ color: '#4CAF50', marginRight: '15px' }}>
              Нанесено: {lastRoundResults.damageDealt}
            </span>
            <span style={{ color: '#f44336' }}>
              Получено: {lastRoundResults.damageTaken}
            </span>
          </div>
        )}
      </div>

      {battleState.status === 'active' && (
        <>
          <ZoneSelector
            type="attack"
            zones={ZONES}
            selectedZones={selectedAttacks}
            maxSelections={2}
            onToggle={toggleAttack}
            lastRoundHits={lastRoundResults.playerHits}
            lastRoundMisses={lastRoundResults.playerMisses}
          />

          <ZoneSelector
            type="defense"
            zones={ZONES}
            selectedZones={selectedDefenses}
            maxSelections={3}
            onToggle={toggleDefense}
            lastRoundBlocked={lastRoundResults.monsterBlocked}
            lastRoundMisses={lastRoundResults.monsterHits}
          />

          <button
            onClick={submitActions}
            disabled={selectedAttacks.length !== 2 || selectedDefenses.length !== 3}
            style={{
              ...styles.button,
              ...(selectedAttacks.length === 2 && selectedDefenses.length === 3 ? styles.buttonActive : styles.buttonDisabled),
            }}
          >
            ⚔️ Атаковать!
          </button>
        </>
      )}

      {(battleState.status === 'won' || battleState.status === 'lost') && (
        <>
          <div style={{ textAlign: 'center', fontSize: '48px', margin: '20px 0' }}>
            {battleState.status === 'won' ? '🎉' : '💀'}
          </div>

          {battleState.status === 'won' && (
            <div style={styles.lootContainer}>
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
            style={{ ...styles.button, ...styles.buttonActive }}
          >
            Вернуться к выбору сложности
          </button>
        </>
      )}
    </div>
  );
};