import type { Character, InventoryItem } from '../../types/api';
import { useEquipItemMutation, useUnequipItemMutation } from '../../store/api/characterApi';
import { StatsCalculator } from '../../utils/statsCalculator';

interface CharacterCardProps {
  character: Character;
  onEquipmentClick?: (slotType: string) => void;
}

export function CharacterCard({ character, onEquipmentClick }: CharacterCardProps) {
  const [equipItem] = useEquipItemMutation();
  const [unequipItem] = useUnequipItemMutation();

  // Получаем надетую экипировку
  const equippedItems = character.inventory?.items?.filter(item => item.isEquipped) || [];

  // Группируем экипировку по слотам
  const equipmentSlots = {
    WEAPON: equippedItems.find(item => item.item.type === 'WEAPON'),
    HELMET: equippedItems.find(item => item.item.type === 'HELMET'),
    ARMOR: equippedItems.find(item => item.item.type === 'ARMOR'),
    BOOTS: equippedItems.find(item => item.item.type === 'BOOTS'),
    BELT: equippedItems.find(item => item.item.type === 'BELT'),
    RING: equippedItems.find(item => item.item.type === 'RING'),
  };

  const handleSlotClick = (slotType: string, item?: InventoryItem) => {
    if (onEquipmentClick) {
      onEquipmentClick(slotType);
    }
  };

  // Вычисляем эффективные характеристики персонажа
  const effectiveStats = StatsCalculator.calculateEffectiveStats(character);

  return (
    <div className="border-3 border-amber-700/60 rounded-xl bg-gradient-to-b from-stone-950/50 to-black/50 p-4 relative h-full">
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-700/60"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-700/60"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-700/60"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-700/60"></div>

      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Left Half - Character */}
        <div className="flex flex-col gap-2 h-full">
          {/* Class */}
          <div className="px-4 py-2 border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 text-center text-amber-200 tracking-wider uppercase text-sm" style={{ fontFamily: 'serif' }}>
            {character.class}
          </div>

          {/* Name */}
          <div className="px-4 py-2 border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 text-center text-amber-200 tracking-wider uppercase text-sm" style={{ fontFamily: 'serif' }}>
            {character.name}
          </div>

          {/* Character Circle - Takes remaining space */}
          <div className="flex-1 w-full rounded-full border-[3px] border-amber-700/60 bg-gradient-to-br from-red-950/60 via-stone-900 to-black flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
            <div className="absolute top-1/3 left-1/4 w-3 h-3 rounded-full bg-red-600 blur-sm animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.9)]"></div>
            <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-red-600 blur-sm animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.9)]" style={{ animationDelay: '0.5s' }}></div>
            <span className="text-4xl text-amber-200 tracking-wider" style={{ fontFamily: 'serif' }}>CHAR</span>
          </div>

          {/* Level Bar at the bottom */}
          <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 overflow-hidden">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-amber-700 to-amber-500 px-3 py-1">
                <span className="text-black text-sm uppercase tracking-wider" style={{ fontFamily: 'serif' }}>LVL {character.level}</span>
              </div>
              <div className="flex-1 h-full bg-black/40"></div>
            </div>
          </div>
        </div>

        {/* Right Half - Split between Stats and Equipment */}
        <div className="flex flex-col gap-3 h-full">
          {/* Stats Box - Top Half */}
          <div className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 p-3 h-1/2 flex items-center justify-center">
            <div className="space-y-1 text-[11px] text-amber-200 w-full" style={{ fontFamily: "'Courier New', monospace", letterSpacing: '0.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span style={{ whiteSpace: 'nowrap' }}>HIT POINT</span>
                <span style={{ flex: 1, overflow: 'hidden', textAlign: 'center', padding: '0 4px', opacity: 0.6, fontSize: '13px', lineHeight: '11px', whiteSpace: 'nowrap' }}>{'.'.repeat(50)}</span>
                <span style={{ whiteSpace: 'nowrap' }}>{effectiveStats.maxHp}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span style={{ whiteSpace: 'nowrap' }}>CURRENT HP</span>
                <span style={{ flex: 1, overflow: 'hidden', textAlign: 'center', padding: '0 4px', opacity: 0.6, fontSize: '13px', lineHeight: '11px', whiteSpace: 'nowrap' }}>{'.'.repeat(50)}</span>
                <span style={{ whiteSpace: 'nowrap' }}>{effectiveStats.currentHp}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span style={{ whiteSpace: 'nowrap' }}>DAMAGE</span>
                <span style={{ flex: 1, overflow: 'hidden', textAlign: 'center', padding: '0 4px', opacity: 0.6, fontSize: '13px', lineHeight: '11px', whiteSpace: 'nowrap' }}>{'.'.repeat(50)}</span>
                <span style={{ whiteSpace: 'nowrap' }}>{effectiveStats.damage}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span style={{ whiteSpace: 'nowrap' }}>ARMOR</span>
                <span style={{ flex: 1, overflow: 'hidden', textAlign: 'center', padding: '0 4px', opacity: 0.6, fontSize: '13px', lineHeight: '11px', whiteSpace: 'nowrap' }}>{'.'.repeat(50)}</span>
                <span style={{ whiteSpace: 'nowrap' }}>{effectiveStats.armor}</span>
              </div>
              <div className="h-px bg-amber-800/30 my-1"></div>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span style={{ whiteSpace: 'nowrap' }}>STR</span>
                <span style={{ flex: 1, overflow: 'hidden', textAlign: 'center', padding: '0 4px', opacity: 0.6, fontSize: '13px', lineHeight: '11px', whiteSpace: 'nowrap' }}>{'.'.repeat(50)}</span>
                <span style={{ whiteSpace: 'nowrap' }}>{effectiveStats.strength}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span style={{ whiteSpace: 'nowrap' }}>AGI</span>
                <span style={{ flex: 1, overflow: 'hidden', textAlign: 'center', padding: '0 4px', opacity: 0.6, fontSize: '13px', lineHeight: '11px', whiteSpace: 'nowrap' }}>{'.'.repeat(50)}</span>
                <span style={{ whiteSpace: 'nowrap' }}>{effectiveStats.agility}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span style={{ whiteSpace: 'nowrap' }}>INT</span>
                <span style={{ flex: 1, overflow: 'hidden', textAlign: 'center', padding: '0 4px', opacity: 0.6, fontSize: '13px', lineHeight: '11px', whiteSpace: 'nowrap' }}>{'.'.repeat(50)}</span>
                <span style={{ whiteSpace: 'nowrap' }}>{effectiveStats.intelligence}</span>
              </div>
            </div>
          </div>

          {/* Equipment Grid - Bottom Half */}
          <div className="grid grid-cols-2 gap-3 h-1/2 p-5 place-items-center">
            {/* Weapon */}
            <div
              onClick={() => handleSlotClick('WEAPON', equipmentSlots.WEAPON)}
              className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 flex items-center justify-center text-[10px] text-amber-300 uppercase tracking-wider hover:border-amber-600/60 transition-all cursor-pointer aspect-square w-20 h-20"
            >
              {equipmentSlots.WEAPON ? (
                <span className="text-center">{equipmentSlots.WEAPON.item.name}</span>
              ) : (
                'МЕЧ'
              )}
            </div>

            {/* Helmet */}
            <div
              onClick={() => handleSlotClick('HELMET', equipmentSlots.HELMET)}
              className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 flex items-center justify-center text-[10px] text-amber-300 uppercase tracking-wider hover:border-amber-600/60 transition-all cursor-pointer aspect-square w-20 h-20"
            >
              {equipmentSlots.HELMET ? (
                <span className="text-center">{equipmentSlots.HELMET.item.name}</span>
              ) : (
                'ШЛЕМ'
              )}
            </div>

            {/* Armor */}
            <div
              onClick={() => handleSlotClick('ARMOR', equipmentSlots.ARMOR)}
              className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 flex items-center justify-center text-[10px] text-amber-300 uppercase tracking-wider hover:border-amber-600/60 transition-all cursor-pointer aspect-square w-20 h-20"
            >
              {equipmentSlots.ARMOR ? (
                <span className="text-center">{equipmentSlots.ARMOR.item.name}</span>
              ) : (
                'БРОНЯ'
              )}
            </div>

            {/* Boots */}
            <div
              onClick={() => handleSlotClick('BOOTS', equipmentSlots.BOOTS)}
              className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 flex items-center justify-center text-[10px] text-amber-300 uppercase tracking-wider hover:border-amber-600/60 transition-all cursor-pointer aspect-square w-20 h-20"
            >
              {equipmentSlots.BOOTS ? (
                <span className="text-center">{equipmentSlots.BOOTS.item.name}</span>
              ) : (
                'САПОГИ'
              )}
            </div>

            {/* Belt */}
            <div
              onClick={() => handleSlotClick('BELT', equipmentSlots.BELT)}
              className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 flex items-center justify-center text-[10px] text-amber-300 uppercase tracking-wider hover:border-amber-600/60 transition-all cursor-pointer aspect-square w-20 h-20"
            >
              {equipmentSlots.BELT ? (
                <span className="text-center">{equipmentSlots.BELT.item.name}</span>
              ) : (
                'ПОЯС'
              )}
            </div>

            {/* Ring */}
            <div
              onClick={() => handleSlotClick('RING', equipmentSlots.RING)}
              className="border-2 border-amber-800/40 rounded bg-gradient-to-b from-stone-950/50 to-black/50 flex items-center justify-center text-[10px] text-amber-300 uppercase tracking-wider hover:border-amber-600/60 transition-all cursor-pointer aspect-square w-20 h-20"
            >
              {equipmentSlots.RING ? (
                <span className="text-center">{equipmentSlots.RING.item.name}</span>
              ) : (
                'КОЛЬЦО'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
