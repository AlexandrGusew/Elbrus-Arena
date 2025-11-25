import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Character } from '../types/game';
import { ArrowLeft, Hammer } from 'lucide-react';

interface BlacksmithPageProps {
  character: Character;
  onNavigate: (page: string) => void;
}

export function BlacksmithPage({ character, onNavigate }: BlacksmithPageProps) {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  
  // Mock equipment
  const equipment = [
    {
      id: '1',
      name: 'Iron Sword',
      icon: '⚔️',
      level: 5,
      maxLevel: 15,
      successRate: 85,
      cost: 500,
      materials: 2
    },
    {
      id: '2',
      name: 'Steel Shield',
      icon: '🛡️',
      level: 3,
      maxLevel: 15,
      successRate: 90,
      cost: 400,
      materials: 1
    },
    {
      id: '3',
      name: 'Magic Staff',
      icon: '🔮',
      level: 10,
      maxLevel: 15,
      successRate: 60,
      cost: 1000,
      materials: 5
    }
  ];
  
  const handleUpgrade = () => {
    if (!selectedItem) return;
    
    const success = Math.random() * 100 < selectedItem.successRate;
    setUpgradeSuccess(success);
    setShowResult(true);
    
    setTimeout(() => {
      setShowResult(false);
      if (success) {
        setSelectedItem(null);
      }
    }, 3000);
  };
  
  const canUpgrade = selectedItem && 
    character.gold >= selectedItem.cost && 
    selectedItem.level < selectedItem.maxLevel;
  
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
          
          <h2>Blacksmith</h2>
          
          <div className="flex items-center gap-2 text-[#d4a574]">
            <span>{character.gold}</span>
            <span>💰</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Equipment List */}
          <Card className="lg:col-span-2">
            <div className="space-y-4">
              <h3 className="text-sm">Select Equipment to Upgrade</h3>
              
              <div className="space-y-3">
                {equipment.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`
                        p-4 border-2 rounded cursor-pointer transition-smooth
                        ${isSelected 
                          ? 'border-[#d4a574] bg-[rgba(212,165,116,0.1)] gold-glow' 
                          : 'border-[#6b5840] hover:border-[#d4a574]'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{item.icon}</div>
                          <div>
                            <h3 className="text-sm text-[#d4a574]">{item.name}</h3>
                            <div className="text-xs text-[#b8a890]">
                              Level +{item.level} → +{item.level + 1}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right space-y-1">
                          <div className="text-xs text-[#b8a890]">Success Rate</div>
                          <div 
                            className="text-sm"
                            style={{ 
                              color: item.successRate >= 80 ? '#6b8e23' : 
                                     item.successRate >= 50 ? '#cd853f' : '#8b4513'
                            }}
                          >
                            {item.successRate}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-[#6b5840] grid grid-cols-2 gap-4 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#b8a890]">Cost:</span>
                          <span className="text-[#d4a574]">{item.cost} 💰</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#b8a890]">Materials:</span>
                          <span className="text-[#4682b4]">{item.materials} 💎</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
          
          {/* Upgrade Panel */}
          <Card className="lg:col-span-1">
            {selectedItem ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">{selectedItem.icon}</div>
                  <h3 className="text-[#d4a574]">{selectedItem.name}</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-[rgba(29,23,16,0.5)] border border-[#6b5840] rounded">
                    <div className="text-xs text-[#b8a890] mb-2">Current Level</div>
                    <div className="text-2xl text-[#d4a574]">+{selectedItem.level}</div>
                  </div>
                  
                  <div className="flex items-center justify-center text-2xl text-[#d4a574]">
                    ↓
                  </div>
                  
                  <div className="p-4 bg-[rgba(29,23,16,0.5)] border border-[#d4a574] rounded">
                    <div className="text-xs text-[#b8a890] mb-2">Next Level</div>
                    <div className="text-2xl text-[#d4a574]">+{selectedItem.level + 1}</div>
                  </div>
                  
                  <div className="p-4 bg-[rgba(29,23,16,0.5)] border border-[#6b5840] rounded">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-[#b8a890]">Success Rate</div>
                        <div 
                          className="text-lg"
                          style={{ 
                            color: selectedItem.successRate >= 80 ? '#6b8e23' : 
                                   selectedItem.successRate >= 50 ? '#cd853f' : '#8b4513'
                          }}
                        >
                          {selectedItem.successRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[#b8a890]">Cost</div>
                        <div className="text-lg text-[#d4a574]">{selectedItem.cost} 💰</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleUpgrade}
                  disabled={!canUpgrade}
                  className="w-full"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Hammer size={20} />
                    <span>Upgrade</span>
                  </div>
                </Button>
                
                {!canUpgrade && selectedItem.level >= selectedItem.maxLevel && (
                  <p className="text-xs text-center text-[#cd853f]">
                    Maximum level reached
                  </p>
                )}
                
                {!canUpgrade && character.gold < selectedItem.cost && (
                  <p className="text-xs text-center text-[#8b4513]">
                    Not enough gold
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <Hammer size={48} className="text-[#7a6d5a]" />
                <p className="text-[#b8a890] text-sm">
                  Select equipment to upgrade
                </p>
              </div>
            )}
          </Card>
        </div>
        
        {/* Info Card */}
        <Card variant="info">
          <div className="space-y-2">
            <h3 className="text-sm text-[#d4a574]">About Upgrading</h3>
            <p className="text-xs text-[#b8a890] leading-relaxed">
              • Higher upgrade levels have lower success rates<br />
              • Failed upgrades will not destroy your equipment<br />
              • Success rate decreases as level increases<br />
              • Maximum upgrade level is +15
            </p>
          </div>
        </Card>
      </div>
      
      {/* Result Modal */}
      <Modal
        isOpen={showResult}
        onClose={() => setShowResult(false)}
        title={upgradeSuccess ? 'Success!' : 'Failed'}
      >
        <div className="text-center space-y-6 py-6">
          <div className="text-8xl">
            {upgradeSuccess ? '✨' : '💥'}
          </div>
          <h2 className={upgradeSuccess ? 'text-[#6b8e23]' : 'text-[#8b4513]'}>
            {upgradeSuccess 
              ? `Upgrade Successful!` 
              : 'Upgrade Failed'}
          </h2>
          <p className="text-[#b8a890]">
            {upgradeSuccess 
              ? `${selectedItem?.name} is now +${(selectedItem?.level || 0) + 1}!`
              : 'Better luck next time!'}
          </p>
        </div>
      </Modal>
    </div>
  );
}
