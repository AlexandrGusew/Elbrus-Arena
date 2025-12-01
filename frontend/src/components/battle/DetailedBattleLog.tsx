import type { RoundResult, Zone } from '../../hooks/useBattle';

// Описания атак для разных зон
const ATTACK_DESCRIPTIONS: Partial<Record<Zone, string[]>> = {
  head: [
    'Сокрушающий удар по голове',
    'Разящий удар в темя',
    'Точный выпад в голову',
    'Мощный удар булавой по черепу',
  ],
  body: [
    'Пронзающий удар в грудь',
    'Разрубающий удар по корпусу',
    'Сильный удар в торс',
    'Мощный рассекающий удар по телу',
  ],
  legs: [
    'Подсекающий удар по ногам',
    'Режущий удар по бедру',
    'Сокрушающий удар по колену',
    'Пронзающий выпад в ногу',
  ],
  arms: [
    'Рубящий удар по руке',
    'Точный удар по запястью',
    'Сильный удар по плечу',
    'Разящий удар по предплечью',
  ],
};

const DEFENSE_DESCRIPTIONS: Partial<Record<Zone, string>> = {
  head: 'закрыл голову щитом',
  body: 'прикрыл корпус доспехами',
  legs: 'защитил ноги маневром',
  arms: 'блокировал удар по рукам',
};

const ZONE_NAMES: Partial<Record<Zone, string>> = {
  head: 'голова',
  body: 'тело',
  legs: 'ноги',
  arms: 'руки',
};

type DetailedBattleLogProps = {
  roundResults?: RoundResult[];
};

const getRandomAttackDescription = (zone: Zone): string => {
  const descriptions = ATTACK_DESCRIPTIONS[zone];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

export const DetailedBattleLog = ({ roundResults }: DetailedBattleLogProps) => {
  const results = roundResults ?? [];

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.85)',
      border: '2px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '12px',
      padding: '20px',
      height: '100%',
      overflowY: 'auto',
      fontFamily: 'serif',
    }}>
      <h3 style={{
        color: '#d4af37',
        fontSize: '22px',
        marginBottom: '20px',
        textAlign: 'center',
        textShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
        paddingBottom: '10px',
      }}>
        ⚔️ Хроника боя
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {results.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#888',
            fontSize: '16px',
            marginTop: '40px',
            fontStyle: 'italic',
          }}>
            Бой ещё не начался...
          </div>
        ) : (
          results.map((result, index) => {
            const playerHits = result.playerActions.attacks.filter(
              zone => !result.monsterActions.defenses.includes(zone)
            );
            const playerMisses = result.playerActions.attacks.filter(
              zone => result.monsterActions.defenses.includes(zone)
            );
            const monsterHits = result.monsterActions.attacks.filter(
              zone => !result.playerActions.defenses.includes(zone)
            );
            const monsterBlocked = result.monsterActions.attacks.filter(
              zone => result.playerActions.defenses.includes(zone)
            );

            return (
              <div
                key={index}
                style={{
                  background: 'rgba(212, 175, 55, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '8px',
                  padding: '15px',
                }}
              >
                <div style={{
                  color: '#d4af37',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                  paddingBottom: '8px',
                }}>
                  Раунд {result.roundNumber}
                </div>

                {/* Атаки игрока */}
                <div style={{ marginBottom: '10px' }}>
                  {playerHits.map((zone, idx) => (
                    <div
                      key={`hit-${idx}`}
                      style={{
                        color: '#4CAF50',
                        fontSize: '14px',
                        marginBottom: '6px',
                        lineHeight: '1.5',
                      }}
                    >
                      ✅ <span style={{ fontWeight: 'bold' }}>Вы</span> нанесли{' '}
                      <span style={{ fontStyle: 'italic', color: '#66BB6A' }}>
                        "{getRandomAttackDescription(zone)}"
                      </span>
                      {' '}противнику в{' '}
                      <span style={{ fontWeight: 'bold' }}>{ZONE_NAMES[zone]}</span>
                    </div>
                  ))}
                  {playerMisses.map((zone, idx) => (
                    <div
                      key={`miss-${idx}`}
                      style={{
                        color: '#FF9800',
                        fontSize: '14px',
                        marginBottom: '6px',
                        lineHeight: '1.5',
                      }}
                    >
                      🛡️ Противник {DEFENSE_DESCRIPTIONS[zone]} и заблокировал вашу атаку
                    </div>
                  ))}
                </div>

                {/* Урон игрока */}
                {result.monsterDamage > 0 && (
                  <div style={{
                    color: '#d4af37',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    padding: '6px 10px',
                    background: 'rgba(76, 175, 80, 0.15)',
                    borderRadius: '4px',
                    borderLeft: '3px solid #4CAF50',
                  }}>
                    💥 Нанесено урона: {result.monsterDamage}
                  </div>
                )}

                {/* Атаки монстра */}
                <div style={{ marginBottom: '10px' }}>
                  {monsterHits.map((zone, idx) => (
                    <div
                      key={`m-hit-${idx}`}
                      style={{
                        color: '#f44336',
                        fontSize: '14px',
                        marginBottom: '6px',
                        lineHeight: '1.5',
                      }}
                    >
                      ❌ <span style={{ fontWeight: 'bold' }}>Противник</span> нанёс{' '}
                      <span style={{ fontStyle: 'italic', color: '#EF5350' }}>
                        "{getRandomAttackDescription(zone)}"
                      </span>
                      {' '}вам в{' '}
                      <span style={{ fontWeight: 'bold' }}>{ZONE_NAMES[zone]}</span>
                    </div>
                  ))}
                  {monsterBlocked.map((zone, idx) => (
                    <div
                      key={`block-${idx}`}
                      style={{
                        color: '#2196F3',
                        fontSize: '14px',
                        marginBottom: '6px',
                        lineHeight: '1.5',
                      }}
                    >
                      🛡️ Вы {DEFENSE_DESCRIPTIONS[zone]} и отразили атаку противника
                    </div>
                  ))}
                </div>

                {/* Полученный урон */}
                {result.playerDamage > 0 && (
                  <div style={{
                    color: '#d4af37',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    padding: '6px 10px',
                    background: 'rgba(244, 67, 54, 0.15)',
                    borderRadius: '4px',
                    borderLeft: '3px solid #f44336',
                  }}>
                    💔 Получено урона: {result.playerDamage}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Скроллинг вниз при добавлении новых записей */}
      <style>{`
        div::-webkit-scrollbar {
          width: 8px;
        }
        div::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.5);
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.7);
        }
      `}</style>
    </div>
  );
};
