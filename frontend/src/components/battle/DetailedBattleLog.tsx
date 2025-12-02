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

// Детерминированная функция для получения описания атаки
// Использует roundNumber, zone и attackIndex для стабильного выбора описания
// Это гарантирует, что для завершенных раундов описания не меняются
const getAttackDescription = (zone: Zone, roundNumber: number, attackIndex: number = 0): string => {
  const descriptions = ATTACK_DESCRIPTIONS[zone];
  if (!descriptions || descriptions.length === 0) {
    return 'Удар';
  }
  // Используем roundNumber, zone и attackIndex для детерминированного выбора
  // Это гарантирует, что для одного и того же раунда, зоны и индекса всегда будет одно описание
  const seed = roundNumber * 1000 + zone.charCodeAt(0) * 10 + attackIndex;
  const index = seed % descriptions.length;
  return descriptions[index];
};

export const DetailedBattleLog = ({ roundResults }: DetailedBattleLogProps) => {
  const results = roundResults ?? [];
  
  // Убираем дубликаты раундов по roundNumber (на случай если они есть)
  const uniqueResults = results.reduce((acc, result) => {
    const existing = acc.find(r => r.roundNumber === result.roundNumber);
    if (!existing) {
      acc.push(result);
    }
    return acc;
  }, [] as typeof results);
  
  // Сортируем по номеру раунда на случай если порядок нарушен
  const sortedResults = [...uniqueResults].sort((a, b) => a.roundNumber - b.roundNumber);

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.85)',
      border: '2px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '12px',
      padding: '12px',
      height: '100%',
      overflowY: 'auto',
      fontFamily: '"Cinzel", "MedievalSharp", "UnifrakturMaguntia", "IM Fell English", serif',
      fontWeight: '500',
      letterSpacing: '0.5px',
    }}>
      <h3 style={{
        color: '#d4af37',
        fontSize: '16px',
        marginBottom: '10px',
        textAlign: 'center',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 10px rgba(212, 175, 55, 0.5)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
        paddingBottom: '6px',
        fontFamily: '"Cinzel", "MedievalSharp", "UnifrakturMaguntia", "IM Fell English", serif',
        fontWeight: '600',
        letterSpacing: '1px',
        textTransform: 'uppercase',
      }}>
        ⚔️ Хроника боя
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sortedResults.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#888',
            fontSize: '12px',
            marginTop: '20px',
            fontStyle: 'italic',
          }}>
            Бой ещё не начался...
          </div>
        ) : (
          sortedResults.map((result) => {
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
                key={`round-${result.roundNumber}`}
                style={{
                  background: 'rgba(212, 175, 55, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: '6px',
                  padding: '8px',
                }}
              >
                <div style={{
                  color: '#d4af37',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                  paddingBottom: '4px',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                  letterSpacing: '0.5px',
                }}>
                  Раунд {result.roundNumber}
                </div>

                {/* Атаки игрока */}
                <div style={{ marginBottom: '6px' }}>
                  {playerHits.map((zone, idx) => (
                    <div
                      key={`hit-${idx}`}
                      style={{
                        color: '#4CAF50',
                        fontSize: '11px',
                        marginBottom: '3px',
                        lineHeight: '1.3',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                      }}
                    >
                      ✅ <span style={{ fontWeight: 'bold' }}>Вы</span> нанесли{' '}
                      <span style={{ fontStyle: 'italic', color: '#66BB6A' }}>
                        "{getAttackDescription(zone, result.roundNumber, idx)}"
                      </span>
                      {' '}в{' '}
                      <span style={{ fontWeight: 'bold' }}>{ZONE_NAMES[zone]}</span>
                    </div>
                  ))}
                  {playerMisses.map((zone, idx) => (
                    <div
                      key={`miss-${idx}`}
                      style={{
                        color: '#FF9800',
                        fontSize: '11px',
                        marginBottom: '3px',
                        lineHeight: '1.3',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                      }}
                    >
                      🛡️ Противник {DEFENSE_DESCRIPTIONS[zone]} и заблокировал
                    </div>
                  ))}
                </div>

                {/* Урон игрока */}
                {result.monsterDamage > 0 && (
                  <div style={{
                    color: '#d4af37',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    marginBottom: '6px',
                    padding: '4px 6px',
                    background: 'rgba(76, 175, 80, 0.15)',
                    borderRadius: '3px',
                    borderLeft: '2px solid #4CAF50',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                  }}>
                    💥 Нанесено: {result.monsterDamage}
                  </div>
                )}

                {/* Атаки монстра */}
                <div style={{ marginBottom: '6px' }}>
                  {monsterHits.map((zone, idx) => (
                    <div
                      key={`m-hit-${idx}`}
                      style={{
                        color: '#f44336',
                        fontSize: '11px',
                        marginBottom: '3px',
                        lineHeight: '1.3',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                      }}
                    >
                      ❌ <span style={{ fontWeight: 'bold' }}>Противник</span> нанёс{' '}
                      <span style={{ fontStyle: 'italic', color: '#EF5350' }}>
                        "{getAttackDescription(zone, result.roundNumber, idx)}"
                      </span>
                      {' '}в{' '}
                      <span style={{ fontWeight: 'bold' }}>{ZONE_NAMES[zone]}</span>
                    </div>
                  ))}
                  {monsterBlocked.map((zone, idx) => (
                    <div
                      key={`block-${idx}`}
                      style={{
                        color: '#2196F3',
                        fontSize: '11px',
                        marginBottom: '3px',
                        lineHeight: '1.3',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                      }}
                    >
                      🛡️ Вы {DEFENSE_DESCRIPTIONS[zone]} и отразили
                    </div>
                  ))}
                </div>

                {/* Полученный урон */}
                {result.playerDamage > 0 && (
                  <div style={{
                    color: '#d4af37',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '4px 6px',
                    background: 'rgba(244, 67, 54, 0.15)',
                    borderRadius: '3px',
                    borderLeft: '2px solid #f44336',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
                  }}>
                    💔 Получено: {result.playerDamage}
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
