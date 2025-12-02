import { useState, useEffect } from 'react';
import type { Zone, RoundResult } from '../../hooks/useBattle';
import { getAssetUrl } from '../../utils/assetUrl';

const ZONE_NAMES: Partial<Record<Zone, string>> = {
  head: 'Голова',
  body: 'Тело',
  legs: 'Ноги',
  arms: 'Руки',
};

const ZONE_IMAGES: Partial<Record<Zone, string>> = {
  head: getAssetUrl('dungeon/battle/head (1).png'),
  body: getAssetUrl('dungeon/battle/chest (1).png'),
  legs: getAssetUrl('dungeon/battle/legs (1).png'),
  arms: getAssetUrl('dungeon/battle/arms (1).png'),
};

const ALL_ZONES = ['head', 'body', 'legs', 'arms'] as const;

type EnemyActionsProps = {
  lastRoundResult?: RoundResult;
};

export const EnemyActions = ({ lastRoundResult }: EnemyActionsProps) => {
  // Сохраняем результаты последнего раунда, чтобы они не исчезали
  const [savedResult, setSavedResult] = useState<RoundResult | undefined>(lastRoundResult);

  useEffect(() => {
    if (lastRoundResult) {
      setSavedResult(lastRoundResult);
    }
  }, [lastRoundResult]);

  const enemyAttacks = savedResult?.monsterActions.attacks || [];
  const enemyDefenses = savedResult?.monsterActions.defenses || [];

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.85)',
      border: '2px solid rgba(139, 0, 0, 0.5)',
      borderRadius: '12px',
      padding: '10px',
      height: '100%',
      fontFamily: 'serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <h3 style={{
        color: '#dc143c',
        fontSize: '16px',
        marginBottom: '8px',
        textAlign: 'center',
        textShadow: '0 0 10px rgba(220, 20, 60, 0.5)',
        borderBottom: '1px solid rgba(139, 0, 0, 0.3)',
        paddingBottom: '5px',
      }}>
        👹 Действия противника
      </h3>

      {!savedResult ? (
        <div style={{
          textAlign: 'center',
          color: '#888',
          fontSize: '16px',
          marginTop: '60px',
          fontStyle: 'italic',
        }}>
          Ждём первого раунда...
        </div>
      ) : (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: '5px',
        }}>
          {/* Атаки противника */}
          <div style={{ marginBottom: '8px' }}>
            <h4 style={{
              color: '#ff6b6b',
              fontSize: '13px',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              ⚔️ Атаки ({enemyAttacks.length}/2)
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '4px',
            }}>
              {ALL_ZONES.map(zone => {
                const isAttacking = enemyAttacks.includes(zone);
                return (
                  <div
                    key={`attack-${zone}`}
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '240px',
                      maxHeight: '240px',
                      border: isAttacking ? '3px solid #ff4444' : '2px solid rgba(255, 68, 68, 0.2)',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: isAttacking ? 'rgba(255, 68, 68, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                      opacity: isAttacking ? 1 : 0.4,
                      boxShadow: isAttacking ? '0 0 15px rgba(255, 68, 68, 0.4)' : 'none',
                    }}
                  >
                    <img
                      src={ZONE_IMAGES[zone]}
                      alt={ZONE_NAMES[zone]}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        filter: isAttacking ? 'none' : 'grayscale(100%)',
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '3px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(0, 0, 0, 0.8)',
                      color: isAttacking ? '#ff4444' : '#666',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                    }}>
                      {ZONE_NAMES[zone]}
                    </div>
                    {isAttacking && (
                      <div style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        color: '#ff4444',
                        fontSize: '16px',
                      }}>
                        ⚔️
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Защита противника */}
          <div>
            <h4 style={{
              color: '#4da6ff',
              fontSize: '13px',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              🛡️ Защита ({enemyDefenses.length}/3)
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '4px',
            }}>
              {ALL_ZONES.map(zone => {
                const isDefending = enemyDefenses.includes(zone);
                return (
                  <div
                    key={`defense-${zone}`}
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '240px',
                      maxHeight: '240px',
                      border: isDefending ? '3px solid #2196F3' : '2px solid rgba(33, 150, 243, 0.2)',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: isDefending ? 'rgba(33, 150, 243, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                      opacity: isDefending ? 1 : 0.4,
                      boxShadow: isDefending ? '0 0 15px rgba(33, 150, 243, 0.4)' : 'none',
                    }}
                  >
                    <img
                      src={ZONE_IMAGES[zone]}
                      alt={ZONE_NAMES[zone]}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        filter: isDefending ? 'none' : 'grayscale(100%)',
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '3px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(0, 0, 0, 0.8)',
                      color: isDefending ? '#2196F3' : '#666',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                    }}>
                      {ZONE_NAMES[zone]}
                    </div>
                    {isDefending && (
                      <div style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        color: '#2196F3',
                        fontSize: '16px',
                      }}>
                        🛡️
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
