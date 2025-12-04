import { useState } from 'react';
import type { Character, InventoryItem } from '../../types/api';
import { useEnhanceItemMutation } from '../../store/api/characterApi';

interface ForgeSectionProps {
  character: Character;
  onClose?: () => void;
}

interface UpgradeHistoryEntry {
  id: number;
  timestamp: Date;
  message: string;
  success: boolean;
}

export function ForgeSection({ character, onClose }: ForgeSectionProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [upgradeHistory, setUpgradeHistory] = useState<UpgradeHistoryEntry[]>([]);

  const [enhanceItem, { isLoading: isEnhancing }] = useEnhanceItemMutation();

  // Получаем предметы из инвентаря (только не надетые)
  const inventoryItems = character.inventory?.items?.filter(item => !item.isEquipped) || [];

  const handleUpgrade = async () => {
    if (!selectedItem || isEnhancing) return;

    try {
      const result = await enhanceItem({
        characterId: character.id,
        itemId: selectedItem.id,
      }).unwrap();

      const message = result.success
        ? `Успешное улучшение: ${selectedItem.item.name}+${selectedItem.enhancement} → +${result.newEnhancement}`
        : `Неудача: ${selectedItem.item.name}+${selectedItem.enhancement} не удалось улучшить`;

      setUpgradeHistory(prev => [
        {
          id: Date.now(),
          timestamp: new Date(),
          message,
          success: result.success,
        },
        ...prev.slice(0, 9), // Храним последние 10 записей
      ]);

      // Сбрасываем выбранный предмет после улучшения
      setSelectedItem(null);
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Ошибка улучшения предмета';
      setUpgradeHistory(prev => [
        {
          id: Date.now(),
          timestamp: new Date(),
          message: `Ошибка: ${errorMessage}`,
          success: false,
        },
        ...prev.slice(0, 9),
      ]);
    }
  };

  return (
    <div className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 p-6 relative h-full flex flex-col">
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/60"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/60"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/60"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/60"></div>

      <div className="flex flex-col gap-4 h-full">
        {/* Top Row - Selected Item Name */}
        <div className="grid grid-cols-1 gap-4">
          <div className="border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/80 to-black/90 px-4 py-2 flex items-center justify-center">
            <span className="text-amber-200 uppercase tracking-wider text-sm" style={{ fontFamily: 'serif' }}>
              {selectedItem ? `${selectedItem.item.name} +${selectedItem.enhancement}` : 'Выберите предмет'}
            </span>
          </div>
        </div>

        {/* Middle Row - Item Slot and Info */}
        <div className="grid grid-cols-2 gap-4">
          {/* Item Slot */}
          <div className="aspect-square border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/60 to-black/80 hover:border-amber-600/60 transition-all relative overflow-hidden">
            {selectedItem ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-2">
                <span className="text-amber-300 text-sm text-center" style={{ fontFamily: 'serif' }}>
                  {selectedItem.item.name}
                </span>
                <span className="text-green-400 text-lg mt-2">+{selectedItem.enhancement}</span>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-amber-300/40 text-xs" style={{ fontFamily: 'serif' }}>Item Slot</span>
              </div>
            )}
          </div>

          {/* Item Selection Grid */}
          <div className="grid grid-cols-3 gap-2">
            {inventoryItems.slice(0, 6).map((invItem) => (
              <div
                key={invItem.id}
                onClick={() => setSelectedItem(invItem)}
                className={`border-2 rounded-lg bg-gradient-to-b from-stone-950/60 to-black/80 hover:border-amber-600/60 transition-all cursor-pointer flex flex-col items-center justify-center p-1 aspect-square ${
                  selectedItem?.id === invItem.id ? 'border-red-700/80' : 'border-amber-800/40'
                }`}
              >
                <span className="text-amber-300 text-[10px] text-center leading-tight" style={{ fontFamily: 'serif' }}>
                  {invItem.item.name.substring(0, 10)}
                </span>
                {invItem.enhancement > 0 && (
                  <span className="text-green-400 text-[10px]">+{invItem.enhancement}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade Button */}
        <button
          onClick={handleUpgrade}
          disabled={!selectedItem || isEnhancing}
          className={`border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/90 to-black/90 py-4 relative transition-all group ${
            !selectedItem || isEnhancing ? 'opacity-50 cursor-not-allowed' : 'hover:border-red-700/70 cursor-pointer'
          }`}
        >
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/50 group-hover:border-red-700/80 transition-all"></div>

          <span className="text-3xl uppercase tracking-[0.3em]" style={{
            fontFamily: 'serif',
            textShadow: '0 0 15px rgba(217, 119, 6, 0.6)',
            background: 'linear-gradient(to bottom, #fef3c7 0%, #f59e0b 50%, #92400e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {isEnhancing ? 'Upgrading...' : 'Upgrade'}
          </span>
        </button>

        {/* History Section */}
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          {/* History Header */}
          <div className="border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/80 to-black/90 px-4 py-2">
            <h3 className="text-amber-200 uppercase tracking-wider text-center text-xs" style={{ fontFamily: 'serif' }}>
              История улучшений
            </h3>
          </div>

          {/* History List */}
          <div className="flex-1 border-2 border-amber-800/40 rounded-lg bg-gradient-to-b from-stone-950/60 to-black/80 p-3 overflow-y-auto min-h-0">
            {upgradeHistory.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-amber-200/40 text-xs" style={{ fontFamily: 'serif' }}>
                  История пуста
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {upgradeHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className={`text-xs ${entry.success ? 'text-green-400' : 'text-red-400'}`}
                    style={{ fontFamily: 'serif' }}
                  >
                    {entry.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
