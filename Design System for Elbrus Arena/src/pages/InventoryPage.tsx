import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Character } from '../types/game';
import { ArrowLeft, Package } from 'lucide-react';

interface InventoryPageProps {
  character: Character;
  onNavigate: (page: string) => void;
}

interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion' | 'material';
  icon: string;
  quantity: number;
  description: string;
  stats?: string;
}

export function InventoryPage({ character, onNavigate }: InventoryPageProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  // Mock inventory items
  const items: InventoryItem[] = [
    {
      id: '1',
      name: 'Iron Sword',
      type: 'weapon',
      icon: '⚔️',
      quantity: 1,
      description: 'A well-forged blade of fine iron',
      stats: '+25 Strength'
    },
    {
      id: '2',
      name: 'Steel Shield',
      type: 'armor',
      icon: '🛡️',
      quantity: 1,
      description: 'Heavy steel protection',
      stats: '+30 Health'
    },
    {
      id: '3',
      name: 'Health Potion',
      type: 'potion',
      icon: '🧪',
      quantity: 5,
      description: 'Restores 50 HP instantly',
      stats: 'Consumable'
    },
    {
      id: '4',
      name: 'Upgrade Stone',
      type: 'material',
      icon: '💎',
      quantity: 3,
      description: 'Used for equipment enhancement',
      stats: 'Material'
    }
  ];
  
  const slots = Array.from({ length: 20 }, (_, i) => i);
  
  const typeColors = {
    weapon: '#8b4513',
    armor: '#4682b4',
    potion: '#6b8e23',
    material: '#d4a574'
  };
  
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
          
          <h2>Inventory</h2>
          
          <div className="flex items-center gap-2 text-[#d4a574]">
            <span>{character.gold}</span>
            <span>💰</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory Grid */}
          <Card className="lg:col-span-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm">Items</h3>
                <span className="text-xs text-[#b8a890]">{items.length} / 20</span>
              </div>
              
              <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                {slots.map((slot) => {
                  const item = items[slot];
                  const isSelected = selectedItem?.id === item?.id;
                  
                  return (
                    <button
                      key={slot}
                      onClick={() => item && setSelectedItem(item)}
                      className={`
                        aspect-square border-2 rounded transition-smooth
                        ${item 
                          ? isSelected 
                            ? 'border-[#d4a574] bg-[rgba(212,165,116,0.2)] gold-glow' 
                            : 'border-[#6b5840] hover:border-[#d4a574] bg-[rgba(45,36,25,0.5)]'
                          : 'border-[#4a3d2a] bg-[rgba(29,23,16,0.5)]'
                        }
                      `}
                    >
                      {item && (
                        <div className="relative h-full flex flex-col items-center justify-center">
                          <div className="text-3xl">{item.icon}</div>
                          {item.quantity > 1 && (
                            <div 
                              className="absolute bottom-1 right-1 text-xs px-1 rounded"
                              style={{ 
                                backgroundColor: 'rgba(26, 20, 16, 0.9)',
                                color: typeColors[item.type]
                              }}
                            >
                              {item.quantity}
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
          
          {/* Item Details */}
          <Card className="lg:col-span-1">
            {selectedItem ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">{selectedItem.icon}</div>
                  <h3 className="text-[#d4a574]">{selectedItem.name}</h3>
                  <div 
                    className="text-xs uppercase tracking-wider mt-2"
                    style={{ color: typeColors[selectedItem.type] }}
                  >
                    {selectedItem.type}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 bg-[rgba(29,23,16,0.5)] border border-[#6b5840] rounded">
                    <div className="text-xs text-[#b8a890] mb-2">Description</div>
                    <p className="text-xs text-[#e8dcc8]">{selectedItem.description}</p>
                  </div>
                  
                  {selectedItem.stats && (
                    <div className="p-3 bg-[rgba(29,23,16,0.5)] border border-[#d4a574] rounded">
                      <div className="text-xs text-[#b8a890] mb-2">Stats</div>
                      <p className="text-xs text-[#d4a574]">{selectedItem.stats}</p>
                    </div>
                  )}
                  
                  <div className="p-3 bg-[rgba(29,23,16,0.5)] border border-[#6b5840] rounded">
                    <div className="text-xs text-[#b8a890] mb-2">Quantity</div>
                    <p className="text-[#d4a574]">{selectedItem.quantity}</p>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t border-[#6b5840]">
                  {selectedItem.type === 'weapon' || selectedItem.type === 'armor' ? (
                    <Button variant="primary" size="md" className="w-full">
                      Equip
                    </Button>
                  ) : null}
                  
                  {selectedItem.type === 'potion' ? (
                    <Button variant="primary" size="md" className="w-full">
                      Use
                    </Button>
                  ) : null}
                  
                  <Button variant="secondary" size="md" className="w-full">
                    Sell for {50 * selectedItem.quantity} 💰
                  </Button>
                  
                  <Button variant="danger" size="sm" className="w-full">
                    Discard
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <Package size={48} className="text-[#7a6d5a]" />
                <p className="text-[#b8a890] text-sm">
                  Select an item to view details
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
