import { useState } from 'react';
import type { Zone, RoundActions, BattleState } from '../../hooks/useBattle';
import { BattleStats } from './BattleStats';
import { RoundLog } from './RoundLog';
import { ZoneSelector } from './ZoneSelector';
import { DungeonProgress } from './DungeonProgress';
import { styles } from '../../pages/Dungeon.styles';

type BattleArenaProps = {
  battleState: BattleState;
  isConnected: boolean;
  onSubmitActions: (actions: RoundActions) => void;
  onReset: () => void;
};

const ZONES: Zone[] = ['head', 'body', 'legs', 'arms'];

export const BattleArena = ({ battleState, isConnected, onSubmitActions, onReset }: BattleArenaProps) => {
  const [selectedAttacks, setSelectedAttacks] = useState<Zone[]>([]);
  const [selectedDefenses, setSelectedDefenses] = useState<Zone[]>([]);

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
      case 'active': return '⚔️ В бою';
      case 'won': return '🎉 Победа!';
      case 'lost': return '💀 Поражение';
      default: return '⏳ Ожидание...';
    }
  };

  return (
    <div style={styles.container}>
      <h1>⚔️ Бой!</h1>

      <div style={{ textAlign: 'center', marginBottom: '10px', fontSize: '12px' }}>
        {isConnected ? '🟢 Подключено' : '🔴 Отключено'}
      </div>

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
      </div>

      {battleState.lastRoundResult && <RoundLog roundResult={battleState.lastRoundResult} />}

      {battleState.status === 'active' && (
        <>
          <ZoneSelector
            type="attack"
            zones={ZONES}
            selectedZones={selectedAttacks}
            maxSelections={2}
            onToggle={toggleAttack}
          />

          <ZoneSelector
            type="defense"
            zones={ZONES}
            selectedZones={selectedDefenses}
            maxSelections={3}
            onToggle={toggleDefense}
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