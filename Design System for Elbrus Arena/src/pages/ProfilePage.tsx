import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatRow } from '../components/StatRow';
import { Character } from '../types/game';
import { ArrowLeft } from 'lucide-react';

interface ProfilePageProps {
  character: Character;
  onNavigate: (page: string) => void;
  onUpdateStats: (stats: Character['stats'], freePoints: number) => void;
}

export function ProfilePage({ character, onNavigate, onUpdateStats }: ProfilePageProps) {
  const [tempStats, setTempStats] = useState({ ...character.stats });
  const [tempFreePoints, setTempFreePoints] = useState(character.freePoints);
  
  const handleIncrease = (stat: keyof Character['stats']) => {
    if (tempFreePoints > 0) {
      setTempStats({ ...tempStats, [stat]: tempStats[stat] + 1 });
      setTempFreePoints(tempFreePoints - 1);
    }
  };
  
  const handleDecrease = (stat: keyof Character['stats']) => {
    if (tempStats[stat] > character.stats[stat]) {
      setTempStats({ ...tempStats, [stat]: tempStats[stat] - 1 });
      setTempFreePoints(tempFreePoints + 1);
    }
  };
  
  const handleReset = () => {
    setTempStats({ ...character.stats });
    setTempFreePoints(character.freePoints);
  };
  
  const handleSave = () => {
    onUpdateStats(tempStats, tempFreePoints);
  };
  
  const hasChanges = JSON.stringify(tempStats) !== JSON.stringify(character.stats);
  const winRate = character.wins + character.losses > 0 
    ? ((character.wins / (character.wins + character.losses)) * 100).toFixed(1)
    : '0.0';
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('dashboard')}
          >
            <ArrowLeft size={16} />
          </Button>
          
          <h2>Character Profile</h2>
          
          <div className="w-20" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar & Info */}
          <Card className="lg:col-span-1">
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="w-40 h-40 bg-gradient-to-br from-[#8b6f47] to-[#d4a574] rounded flex items-center justify-center text-7xl border-2 border-[#d4a574] gold-glow">
                  {character.class === 'warrior' && '⚔️'}
                  {character.class === 'assassin' && '🗡️'}
                  {character.class === 'mage' && '🔮'}
                </div>
              </div>
              
              {/* Info */}
              <div className="space-y-3">
                <div className="text-center">
                  <h3>{character.name}</h3>
                  <div className="text-xs text-[#b8a890] uppercase">{character.class}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#6b5840]">
                  <div className="text-center">
                    <div className="text-xs text-[#b8a890]">Level</div>
                    <div className="text-[#d4a574]">{character.level}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[#b8a890]">Gold</div>
                    <div className="text-[#d4a574]">{character.gold}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[#b8a890]">PvP Rating</div>
                    <div className="text-[#4682b4]">{character.pvpRating}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[#b8a890]">Win Rate</div>
                    <div className="text-[#6b8e23]">{winRate}%</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Stats Editor */}
          <Card className="lg:col-span-2">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3>Statistics</h3>
                <div className="text-[#d4a574] text-sm">
                  Free Points: <span className="text-2xl ml-2">{tempFreePoints}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <StatRow
                  icon="❤️"
                  label="Health"
                  value={tempStats.health}
                  showControls={true}
                  onIncrease={() => handleIncrease('health')}
                  onDecrease={() => handleDecrease('health')}
                />
                
                <StatRow
                  icon="💪"
                  label="Strength"
                  value={tempStats.strength}
                  showControls={true}
                  onIncrease={() => handleIncrease('strength')}
                  onDecrease={() => handleDecrease('strength')}
                />
                
                <StatRow
                  icon="⚡"
                  label="Instinct"
                  value={tempStats.instinct}
                  showControls={true}
                  onIncrease={() => handleIncrease('instinct')}
                  onDecrease={() => handleDecrease('instinct')}
                />
                
                <StatRow
                  icon="🏃"
                  label="Agility"
                  value={tempStats.agility}
                  showControls={true}
                  onIncrease={() => handleIncrease('agility')}
                  onDecrease={() => handleDecrease('agility')}
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-[#6b5840]">
                <Button
                  variant="danger"
                  size="md"
                  onClick={handleReset}
                  disabled={!hasChanges}
                  className="flex-1"
                >
                  Reset
                </Button>
                
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => onNavigate('dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="flex-1"
                >
                  Save
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Battle History */}
        <Card variant="info">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-xs text-[#b8a890]">WINS</div>
              <div className="text-[#6b8e23]">{character.wins}</div>
            </div>
            <div>
              <div className="text-3xl mb-2">💀</div>
              <div className="text-xs text-[#b8a890]">LOSSES</div>
              <div className="text-[#8b4513]">{character.losses}</div>
            </div>
            <div>
              <div className="text-3xl mb-2">📊</div>
              <div className="text-xs text-[#b8a890]">TOTAL</div>
              <div className="text-[#4682b4]">{character.wins + character.losses}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
