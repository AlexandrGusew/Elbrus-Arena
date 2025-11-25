import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { Character, Enemy, BattleLog } from '../types/game';
import { ArrowLeft } from 'lucide-react';

interface BattlePageProps {
  character: Character;
  enemy: Enemy;
  onNavigate: (page: string) => void;
  onBattleEnd: (victory: boolean, rewards?: { exp: number; gold: number }) => void;
}

export function BattlePage({ character, enemy, onNavigate, onBattleEnd }: BattlePageProps) {
  const [playerHealth, setPlayerHealth] = useState(character.stats.health);
  const [enemyHealth, setEnemyHealth] = useState(enemy.health);
  const [attackZones, setAttackZones] = useState<number[]>([]);
  const [defenseZones, setDefenseZones] = useState<number[]>([]);
  const [round, setRound] = useState(1);
  const [logs, setLogs] = useState<BattleLog[]>([
    { id: '1', message: 'Battle started!', type: 'system' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const zones = [1, 2, 3, 4, 5, 6];
  
  const toggleAttackZone = (zone: number) => {
    if (attackZones.includes(zone)) {
      setAttackZones(attackZones.filter(z => z !== zone));
    } else if (attackZones.length < 2) {
      setAttackZones([...attackZones, zone]);
    }
  };
  
  const toggleDefenseZone = (zone: number) => {
    if (defenseZones.includes(zone)) {
      setDefenseZones(defenseZones.filter(z => z !== zone));
    } else if (defenseZones.length < 3) {
      setDefenseZones([...defenseZones, zone]);
    }
  };
  
  const addLog = (message: string, type: 'player' | 'enemy' | 'system') => {
    setLogs(prev => [...prev, { id: Date.now().toString(), message, type }]);
  };
  
  const processTurn = () => {
    if (attackZones.length !== 2 || defenseZones.length !== 3) return;
    
    setIsProcessing(true);
    
    // Enemy chooses random zones
    const enemyAttack = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ];
    const enemyDefense = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ];
    
    // Calculate damage
    const playerHits = attackZones.filter(z => !enemyDefense.includes(z)).length;
    const enemyHits = enemyAttack.filter(z => !defenseZones.includes(z)).length;
    
    const playerDamage = playerHits * (character.stats.strength + 10);
    const enemyDamage = enemyHits * enemy.damage;
    
    setTimeout(() => {
      // Apply damage
      if (playerDamage > 0) {
        setEnemyHealth(prev => Math.max(0, prev - playerDamage));
        addLog(`You dealt ${playerDamage} damage!`, 'player');
      } else {
        addLog('Your attack was blocked!', 'player');
      }
      
      if (enemyDamage > 0) {
        setPlayerHealth(prev => Math.max(0, prev - enemyDamage));
        addLog(`${enemy.name} dealt ${enemyDamage} damage!`, 'enemy');
      } else {
        addLog(`You blocked ${enemy.name}'s attack!`, 'player');
      }
      
      setRound(prev => prev + 1);
      setAttackZones([]);
      setDefenseZones([]);
      setIsProcessing(false);
    }, 1000);
  };
  
  // Check for battle end
  useEffect(() => {
    if (enemyHealth <= 0) {
      setTimeout(() => {
        onBattleEnd(true, { exp: 100, gold: 200 });
      }, 1500);
    } else if (playerHealth <= 0) {
      setTimeout(() => {
        onBattleEnd(false);
      }, 1500);
    }
  }, [enemyHealth, playerHealth, onBattleEnd]);
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('dashboard')}
          >
            <ArrowLeft size={16} />
          </Button>
          
          <div className="text-[#d4a574] uppercase tracking-wider">
            Round {round}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Battle Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enemy */}
            <Card>
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-[#8b4513]">{enemy.name}</h3>
                  <div className="text-xs text-[#b8a890]">Level {enemy.level}</div>
                </div>
                
                <div className="flex justify-center text-7xl">
                  👾
                </div>
                
                <ProgressBar 
                  type="hp" 
                  current={enemyHealth} 
                  max={enemy.maxHealth} 
                />
              </div>
            </Card>
            
            {/* Player */}
            <Card>
              <div className="space-y-4">
                <ProgressBar 
                  type="hp" 
                  current={playerHealth} 
                  max={character.stats.health} 
                />
                
                <div className="text-center">
                  <h3 className="text-[#6b8e23]">{character.name}</h3>
                  <div className="text-xs text-[#b8a890]">Level {character.level}</div>
                </div>
              </div>
            </Card>
            
            {/* Zone Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Attack Zones */}
              <Card variant="stat">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm">Attack</h3>
                    <span className="text-xs text-[#8b4513]">
                      {attackZones.length} / 2
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {zones.map(zone => (
                      <button
                        key={zone}
                        onClick={() => toggleAttackZone(zone)}
                        disabled={isProcessing}
                        className={`
                          h-16 border-2 rounded transition-smooth
                          ${attackZones.includes(zone)
                            ? 'border-[#8b4513] bg-[rgba(139,69,19,0.2)] shadow-[0_0_8px_rgba(139,69,19,0.4)]'
                            : 'border-[#4a3d2a] hover:border-[#8b6f47]'
                          }
                          disabled:opacity-50
                        `}
                      >
                        <span className="text-[#d4a574]">{zone}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
              
              {/* Defense Zones */}
              <Card variant="stat">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm">Defense</h3>
                    <span className="text-xs text-[#6b8e23]">
                      {defenseZones.length} / 3
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {zones.map(zone => (
                      <button
                        key={zone}
                        onClick={() => toggleDefenseZone(zone)}
                        disabled={isProcessing}
                        className={`
                          h-16 border-2 rounded transition-smooth
                          ${defenseZones.includes(zone)
                            ? 'border-[#6b8e23] bg-[rgba(107,142,35,0.2)] shadow-[0_0_8px_rgba(107,142,35,0.4)]'
                            : 'border-[#4a3d2a] hover:border-[#8b6f47]'
                          }
                          disabled:opacity-50
                        `}
                      >
                        <span className="text-[#d4a574]">{zone}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Confirm Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={processTurn}
              disabled={attackZones.length !== 2 || defenseZones.length !== 3 || isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Processing...' : 'Confirm Turn'}
            </Button>
          </div>
          
          {/* Battle Log */}
          <Card variant="stat" className="lg:col-span-1">
            <div className="space-y-4">
              <h3 className="text-sm">Battle Log</h3>
              
              <div className="h-[500px] overflow-y-auto custom-scrollbar space-y-2">
                {logs.map(log => (
                  <div
                    key={log.id}
                    className={`
                      text-xs p-2 border-l-2 rounded
                      ${log.type === 'player' ? 'border-[#6b8e23] text-[#8ba850]' : ''}
                      ${log.type === 'enemy' ? 'border-[#8b4513] text-[#cd853f]' : ''}
                      ${log.type === 'system' ? 'border-[#4682b4] text-[#6ba3d4]' : ''}
                    `}
                  >
                    {log.message}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
