import type { RoundResult, Zone } from '../../hooks/useBattle';
import { styles } from '../../pages/Dungeon.styles';

type RoundLogProps = {
  roundResult: RoundResult;
};

const ZONE_ICONS: Record<Zone, string> = {
  head: '🧠',
  body: '🛡️',
  legs: '🦵',
  arms: '💪',
};

const ZONE_NAMES: Record<Zone, string> = {
  head: 'Голова',
  body: 'Тело',
  legs: 'Ноги',
  arms: 'Руки',
};

export const RoundLog = ({ roundResult }: RoundLogProps) => {
  // Анализируем результаты боя
  const playerAttacks = roundResult.playerActions.attacks;
  const playerDefenses = roundResult.playerActions.defenses;
  const monsterAttacks = roundResult.monsterActions.attacks;
  const monsterDefenses = roundResult.monsterActions.defenses;

  // Определяем какие атаки игрока попали
  const playerHits = playerAttacks.filter(zone => !monsterDefenses.includes(zone));
  const playerMisses = playerAttacks.filter(zone => monsterDefenses.includes(zone));

  // Определяем какие атаки монстра попали
  const monsterHits = monsterAttacks.filter(zone => !playerDefenses.includes(zone));
  const monsterBlocked = monsterAttacks.filter(zone => playerDefenses.includes(zone));

  return (
    <div style={{ ...styles.statsBlock, marginBottom: '20px' }}>
      <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>
        ⚔️ Результат раунда {roundResult.roundNumber}
      </h4>

      {/* Ваши атаки */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
          🗡️ Ваши атаки ({roundResult.monsterDamage} урона):
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {playerHits.map((zone, idx) => (
            <span
              key={`hit-${idx}`}
              style={{
                padding: '6px 12px',
                background: '#4CAF50',
                color: 'white',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 'bold',
              }}
            >
              ✅ {ZONE_ICONS[zone]} {ZONE_NAMES[zone]}
            </span>
          ))}
          {playerMisses.map((zone, idx) => (
            <span
              key={`miss-${idx}`}
              style={{
                padding: '6px 12px',
                background: '#666',
                color: '#aaa',
                borderRadius: '6px',
                fontSize: '13px',
                textDecoration: 'line-through',
              }}
            >
              🛡️ {ZONE_ICONS[zone]} {ZONE_NAMES[zone]}
            </span>
          ))}
        </div>
      </div>

      {/* Атаки монстра */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
          💥 Атаки монстра ({roundResult.playerDamage} урона):
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {monsterHits.map((zone, idx) => (
            <span
              key={`m-hit-${idx}`}
              style={{
                padding: '6px 12px',
                background: '#f44336',
                color: 'white',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 'bold',
              }}
            >
              ❌ {ZONE_ICONS[zone]} {ZONE_NAMES[zone]}
            </span>
          ))}
          {monsterBlocked.map((zone, idx) => (
            <span
              key={`m-block-${idx}`}
              style={{
                padding: '6px 12px',
                background: '#2196F3',
                color: 'white',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 'bold',
              }}
            >
              🛡️ {ZONE_ICONS[zone]} {ZONE_NAMES[zone]}
            </span>
          ))}
        </div>
      </div>

      {/* Итого */}
      <div style={{
        marginTop: '12px',
        padding: '10px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '6px',
        fontSize: '12px',
        display: 'flex',
        justifyContent: 'space-around'
      }}>
        <div>
          <span style={{ color: '#4CAF50' }}>✅ Попадания: {playerHits.length}</span>
        </div>
        <div>
          <span style={{ color: '#2196F3' }}>🛡️ Защиты: {monsterBlocked.length}</span>
        </div>
        <div>
          <span style={{ color: '#f44336' }}>❌ Получено: {monsterHits.length}</span>
        </div>
      </div>
    </div>
  );
};