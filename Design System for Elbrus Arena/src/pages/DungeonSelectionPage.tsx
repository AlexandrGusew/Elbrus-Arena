import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { dungeons } from '../data/gameData';
import { Character } from '../types/game';
import { ArrowLeft, Zap } from 'lucide-react';

interface DungeonSelectionPageProps {
  character: Character;
  onNavigate: (page: string, dungeonId?: string) => void;
}

export function DungeonSelectionPage({ character, onNavigate }: DungeonSelectionPageProps) {
  const difficultyColors = {
    easy: '#6b8e23',
    normal: '#4682b4',
    hard: '#cd853f',
    extreme: '#8b4513'
  };
  
  const difficultyLabels = {
    easy: 'EASY',
    normal: 'NORMAL',
    hard: 'HARD',
    extreme: 'EXTREME'
  };
  
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
          
          <h2>Select Dungeon</h2>
          
          <div className="flex items-center gap-2 text-[#6b8e23]">
            <Zap size={16} />
            <span>{character.stamina} / {character.maxStamina}</span>
          </div>
        </div>
        
        {/* Dungeons List */}
        <div className="space-y-4">
          {dungeons.map((dungeon) => {
            const canEnter = character.stamina >= dungeon.staminaCost;
            
            return (
              <Card
                key={dungeon.id}
                className={!canEnter ? 'opacity-50' : ''}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4">
                      <h3>{dungeon.name}</h3>
                      <span 
                        className="text-xs px-3 py-1 border rounded"
                        style={{ 
                          borderColor: difficultyColors[dungeon.difficulty],
                          color: difficultyColors[dungeon.difficulty]
                        }}
                      >
                        {difficultyLabels[dungeon.difficulty]}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-[#b8a890]">Level</div>
                        <div className="text-[#d4a574]">{dungeon.level}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#b8a890]">Rewards</div>
                        <div className="text-[#d4a574]">
                          {dungeon.rewards.gold} 💰 | {dungeon.rewards.exp} EXP
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[#b8a890]">Cost</div>
                        <div className="text-[#6b8e23]">{dungeon.staminaCost} ⚡</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => onNavigate('battle', dungeon.id)}
                      disabled={!canEnter}
                    >
                      Enter
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        
        {/* Info */}
        {character.stamina < 10 && (
          <Card variant="info">
            <p className="text-center text-[#cd853f]">
              ⚠️ Not enough stamina. Wait for regeneration or use items.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
