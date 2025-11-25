import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { Character } from '../types/game';
import { Swords, Shield, Backpack, Hammer, User, Trophy } from 'lucide-react';

interface DashboardPageProps {
  character: Character;
  onNavigate: (page: string) => void;
}

export function DashboardPage({ character, onNavigate }: DashboardPageProps) {
  const winRate = character.wins + character.losses > 0 
    ? ((character.wins / (character.wins + character.losses)) * 100).toFixed(1)
    : '0.0';
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <h2 className="text-center">{character.name}</h2>
          <div className="flex gap-4">
            <ProgressBar type="hp" current={character.stats.health} max={character.stats.health} />
            <ProgressBar type="exp" current={character.exp} max={character.maxExp} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Character Info Card */}
          <Card>
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="w-40 h-40 bg-gradient-to-br from-[#8b6f47] to-[#d4a574] rounded flex items-center justify-center text-7xl border-2 border-[#d4a574] gold-glow">
                  {character.class === 'warrior' && '⚔️'}
                  {character.class === 'assassin' && '🗡️'}
                  {character.class === 'mage' && '🔮'}
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-[#b8a890] uppercase tracking-wider">Class</div>
                  <div className="text-[#d4a574] uppercase">{character.class}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-[#b8a890] uppercase tracking-wider">Level</div>
                  <div className="text-[#d4a574]">{character.level}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-[#b8a890] uppercase tracking-wider">Gold</div>
                  <div className="text-[#d4a574]">{character.gold} 💰</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-[#b8a890] uppercase tracking-wider">Stamina</div>
                  <div className="text-[#d4a574]">{character.stamina} / {character.maxStamina}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-[#b8a890] uppercase tracking-wider">PvP Rating</div>
                  <div className="text-[#4682b4]">{character.pvpRating}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-[#b8a890] uppercase tracking-wider">Win Rate</div>
                  <div className="text-[#6b8e23]">{winRate}%</div>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Actions Card */}
          <Card>
            <div className="space-y-4">
              <h3 className="text-center mb-6">Actions</h3>
              
              <Button
                variant="primary"
                size="lg"
                onClick={() => onNavigate('dungeon')}
                className="w-full"
              >
                <div className="flex items-center justify-center gap-3">
                  <Swords size={20} />
                  <span>Dungeon (PvE)</span>
                </div>
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={() => onNavigate('pvp')}
                className="w-full"
              >
                <div className="flex items-center justify-center gap-3">
                  <Trophy size={20} />
                  <span>Arena (PvP)</span>
                </div>
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={() => onNavigate('inventory')}
                className="w-full"
              >
                <div className="flex items-center justify-center gap-3">
                  <Backpack size={20} />
                  <span>Inventory</span>
                </div>
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={() => onNavigate('blacksmith')}
                className="w-full"
              >
                <div className="flex items-center justify-center gap-3">
                  <Hammer size={20} />
                  <span>Blacksmith</span>
                </div>
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={() => onNavigate('profile')}
                className="w-full"
              >
                <div className="flex items-center justify-center gap-3">
                  <User size={20} />
                  <span>Profile</span>
                </div>
              </Button>
            </div>
          </Card>
        </div>
        
        {/* Stats Overview */}
        <Card variant="info">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">❤️</div>
              <div className="text-xs text-[#b8a890]">HEALTH</div>
              <div className="text-[#d4a574]">{character.stats.health}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💪</div>
              <div className="text-xs text-[#b8a890]">STRENGTH</div>
              <div className="text-[#d4a574]">{character.stats.strength}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-xs text-[#b8a890]">INSTINCT</div>
              <div className="text-[#d4a574]">{character.stats.instinct}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🏃</div>
              <div className="text-xs text-[#b8a890]">AGILITY</div>
              <div className="text-[#d4a574]">{character.stats.agility}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
