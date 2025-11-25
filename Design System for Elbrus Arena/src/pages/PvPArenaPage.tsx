import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Character } from '../types/game';
import { ArrowLeft, Swords } from 'lucide-react';

interface PvPArenaPageProps {
  character: Character;
  onNavigate: (page: string) => void;
}

export function PvPArenaPage({ character, onNavigate }: PvPArenaPageProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [opponent, setOpponent] = useState<{
    name: string;
    level: number;
    class: string;
    rating: number;
    winRate: number;
  } | null>(null);
  
  const startSearch = () => {
    setIsSearching(true);
    
    // Simulate matchmaking
    setTimeout(() => {
      setOpponent({
        name: `Player${Math.floor(Math.random() * 9999)}`,
        level: character.level + Math.floor(Math.random() * 3) - 1,
        class: ['warrior', 'assassin', 'mage'][Math.floor(Math.random() * 3)],
        rating: character.pvpRating + Math.floor(Math.random() * 200) - 100,
        winRate: 40 + Math.random() * 40
      });
      setIsSearching(false);
    }, 3000);
  };
  
  const cancelSearch = () => {
    setIsSearching(false);
    setOpponent(null);
  };
  
  const startBattle = () => {
    alert('PvP Battle would start here! (Demo)');
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
          
          <h2>PvP Arena</h2>
          
          <div className="w-20" />
        </div>
        
        {/* Player Info */}
        <Card variant="info">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xs text-[#b8a890]">Your Level</div>
              <div className="text-[#d4a574]">{character.level}</div>
            </div>
            <div>
              <div className="text-xs text-[#b8a890]">PvP Rating</div>
              <div className="text-[#4682b4]">{character.pvpRating}</div>
            </div>
            <div>
              <div className="text-xs text-[#b8a890]">Wins</div>
              <div className="text-[#6b8e23]">{character.wins}</div>
            </div>
            <div>
              <div className="text-xs text-[#b8a890]">Losses</div>
              <div className="text-[#8b4513]">{character.losses}</div>
            </div>
          </div>
        </Card>
        
        {/* Matchmaking Area */}
        {!opponent && !isSearching && (
          <Card className="text-center">
            <div className="space-y-6 py-12">
              <div className="text-6xl">⚔️</div>
              <h3>Find Opponent</h3>
              <p className="text-[#b8a890] max-w-md mx-auto">
                Challenge other players in the arena. Win to increase your rating and earn rewards!
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={startSearch}
                className="animate-pulse-gold"
              >
                <div className="flex items-center gap-3">
                  <Swords size={20} />
                  <span>Search for Opponent</span>
                </div>
              </Button>
            </div>
          </Card>
        )}
        
        {/* Searching */}
        {isSearching && (
          <Card className="text-center" glow="gold">
            <div className="space-y-6 py-12">
              <div className="text-6xl animate-pulse">🔍</div>
              <h3>Searching for Opponent...</h3>
              <div className="h-2 bg-[rgba(29,23,16,0.8)] rounded-full overflow-hidden max-w-xs mx-auto">
                <div className="h-full animate-shimmer" />
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={cancelSearch}
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}
        
        {/* Opponent Found */}
        {opponent && !isSearching && (
          <div className="space-y-6">
            <Card glow="gold">
              <div className="text-center space-y-6">
                <h3 className="text-[#d4a574] text-shadow-strong">Opponent Found!</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Your Character */}
                  <div className="space-y-4">
                    <div className="text-7xl">
                      {character.class === 'warrior' && '⚔️'}
                      {character.class === 'assassin' && '🗡️'}
                      {character.class === 'mage' && '🔮'}
                    </div>
                    <div>
                      <div className="text-[#4682b4] uppercase tracking-wider">You</div>
                      <div className="text-[#d4a574]">{character.name}</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#b8a890]">Level:</span>
                        <span className="text-[#e8dcc8]">{character.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#b8a890]">Class:</span>
                        <span className="text-[#e8dcc8] uppercase">{character.class}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#b8a890]">Rating:</span>
                        <span className="text-[#4682b4]">{character.pvpRating}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* VS Divider */}
                  <div className="hidden md:flex items-center justify-center">
                    <div className="text-4xl text-[#8b4513] text-shadow-strong">VS</div>
                  </div>
                  <div className="md:hidden">
                    <div className="text-2xl text-[#8b4513]">VS</div>
                  </div>
                  
                  {/* Opponent */}
                  <div className="space-y-4">
                    <div className="text-7xl">
                      {opponent.class === 'warrior' && '⚔️'}
                      {opponent.class === 'assassin' && '🗡️'}
                      {opponent.class === 'mage' && '🔮'}
                    </div>
                    <div>
                      <div className="text-[#cd853f] uppercase tracking-wider">Opponent</div>
                      <div className="text-[#d4a574]">{opponent.name}</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#b8a890]">Level:</span>
                        <span className="text-[#e8dcc8]">{opponent.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#b8a890]">Class:</span>
                        <span className="text-[#e8dcc8] uppercase">{opponent.class}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#b8a890]">Rating:</span>
                        <span className="text-[#4682b4]">{opponent.rating}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#b8a890]">Win Rate:</span>
                        <span className="text-[#6b8e23]">{opponent.winRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 justify-center pt-6">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={cancelSearch}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={startBattle}
                    className="animate-pulse-gold"
                  >
                    Start Battle
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
        
        {/* Leaderboard Preview */}
        <Card variant="info">
          <div className="space-y-4">
            <h3 className="text-sm">Top Players</h3>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((rank) => (
                <div 
                  key={rank}
                  className="flex items-center justify-between p-2 bg-[rgba(29,23,16,0.5)] rounded"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#4682b4] w-6">#{rank}</span>
                    <span className="text-[#d4a574]">Player{1000 + rank * 111}</span>
                  </div>
                  <div className="text-[#d4a574]">{2500 - rank * 100}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
