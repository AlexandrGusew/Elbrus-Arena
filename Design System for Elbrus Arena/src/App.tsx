import React, { useState } from 'react';
import { AuthPage } from './pages/AuthPage';
import { CharacterCreationPage } from './pages/CharacterCreationPage';
import { DashboardPage } from './pages/DashboardPage';
import { DungeonSelectionPage } from './pages/DungeonSelectionPage';
import { BattlePage } from './pages/BattlePage';
import { ProfilePage } from './pages/ProfilePage';
import { PvPArenaPage } from './pages/PvPArenaPage';
import { InventoryPage } from './pages/InventoryPage';
import { BlacksmithPage } from './pages/BlacksmithPage';
import { Modal } from './components/Modal';
import { Button } from './components/Button';
import { Character, CharacterClass } from './types/game';
import { classData, enemies } from './data/gameData';

type Page = 'auth' | 'create' | 'dashboard' | 'dungeon' | 'battle' | 'profile' | 'pvp' | 'inventory' | 'blacksmith';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('auth');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [character, setCharacter] = useState<Character | null>(null);
  const [selectedDungeonId, setSelectedDungeonId] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<{
    victory: boolean;
    rewards?: { exp: number; gold: number };
  } | null>(null);
  
  const handleAuth = () => {
    setIsAuthenticated(true);
    setCurrentPage('create');
  };
  
  const handleCreateCharacter = (name: string, characterClass: CharacterClass) => {
    const baseStats = classData[characterClass].baseStats;
    
    const newCharacter: Character = {
      name,
      class: characterClass,
      level: 1,
      exp: 0,
      maxExp: 100,
      gold: 1000,
      stamina: 100,
      maxStamina: 100,
      pvpRating: 1000,
      wins: 0,
      losses: 0,
      stats: { ...baseStats },
      freePoints: 5
    };
    
    setCharacter(newCharacter);
    setCurrentPage('dashboard');
  };
  
  const handleNavigate = (page: string, dungeonId?: string) => {
    if (dungeonId) {
      setSelectedDungeonId(dungeonId);
    }
    setCurrentPage(page as Page);
  };
  
  const handleBattleEnd = (victory: boolean, rewards?: { exp: number; gold: number }) => {
    setBattleResult({ victory, rewards });
    
    if (character && victory && rewards) {
      const newExp = character.exp + rewards.exp;
      const levelUp = newExp >= character.maxExp;
      
      setCharacter({
        ...character,
        exp: levelUp ? newExp - character.maxExp : newExp,
        level: levelUp ? character.level + 1 : character.level,
        maxExp: levelUp ? character.maxExp + 50 : character.maxExp,
        gold: character.gold + rewards.gold,
        freePoints: levelUp ? character.freePoints + 3 : character.freePoints,
        wins: character.wins + 1
      });
    } else if (character && !victory) {
      setCharacter({
        ...character,
        losses: character.losses + 1
      });
    }
  };
  
  const handleUpdateStats = (stats: Character['stats'], freePoints: number) => {
    if (character) {
      setCharacter({
        ...character,
        stats,
        freePoints
      });
      setCurrentPage('dashboard');
    }
  };
  
  const closeBattleResult = () => {
    setBattleResult(null);
    setCurrentPage('dashboard');
  };
  
  // Get enemy for battle
  const currentEnemy = selectedDungeonId 
    ? enemies[parseInt(selectedDungeonId) - 1] 
    : null;
  
  return (
    <div className="min-h-screen">
      {currentPage === 'auth' && (
        <AuthPage onAuth={handleAuth} />
      )}
      
      {currentPage === 'create' && (
        <CharacterCreationPage onCreate={handleCreateCharacter} />
      )}
      
      {character && currentPage === 'dashboard' && (
        <DashboardPage 
          character={character} 
          onNavigate={handleNavigate} 
        />
      )}
      
      {character && currentPage === 'dungeon' && (
        <DungeonSelectionPage 
          character={character} 
          onNavigate={handleNavigate} 
        />
      )}
      
      {character && currentPage === 'battle' && currentEnemy && (
        <BattlePage 
          character={character}
          enemy={currentEnemy}
          onNavigate={handleNavigate}
          onBattleEnd={handleBattleEnd}
        />
      )}
      
      {character && currentPage === 'profile' && (
        <ProfilePage 
          character={character}
          onNavigate={handleNavigate}
          onUpdateStats={handleUpdateStats}
        />
      )}
      
      {character && currentPage === 'pvp' && (
        <PvPArenaPage 
          character={character}
          onNavigate={handleNavigate}
        />
      )}
      
      {character && currentPage === 'inventory' && (
        <InventoryPage 
          character={character}
          onNavigate={handleNavigate}
        />
      )}
      
      {character && currentPage === 'blacksmith' && (
        <BlacksmithPage 
          character={character}
          onNavigate={handleNavigate}
        />
      )}
      
      {/* Battle Result Modal */}
      {battleResult && (
        <Modal
          isOpen={true}
          onClose={closeBattleResult}
          title={battleResult.victory ? 'VICTORY!' : 'DEFEAT'}
        >
          <div className="text-center space-y-6 py-6">
            <div className="text-8xl">
              {battleResult.victory ? '🏆' : '💀'}
            </div>
            
            {battleResult.victory && battleResult.rewards && (
              <div className="space-y-4">
                <h3 className="text-[#00ff96]">Battle Won!</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-[rgba(0,0,0,0.3)] border border-[#00c8ff] clip-corner-sm">
                    <span className="text-[#6ec8e0]">Experience:</span>
                    <span className="text-[#00ff96]">+{battleResult.rewards.exp}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[rgba(0,0,0,0.3)] border border-[#00c8ff] clip-corner-sm">
                    <span className="text-[#6ec8e0]">Gold:</span>
                    <span className="text-[#ffaa00]">+{battleResult.rewards.gold} 💰</span>
                  </div>
                </div>
              </div>
            )}
            
            {!battleResult.victory && (
              <div className="space-y-2">
                <h3 className="text-[#ff6464]">You were defeated!</h3>
                <p className="text-[#6ec8e0] text-sm">
                  Train harder and try again!
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <Button
              variant="primary"
              size="lg"
              onClick={closeBattleResult}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
