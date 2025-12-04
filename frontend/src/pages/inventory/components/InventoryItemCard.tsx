import type { InventoryItem, ItemType } from "../../../types/api";

const SLOT_ICONS: Record<ItemType, string> = {
  weapon: "⚔️",
  helmet: "🪖",
  armor: "🛡️",
  belt: "🔗",
  legs: "👖",
  accessory: "💍",
  potion: "🧪",
  shield: "🛡️",
  offhand: "🗡️",
};

const SLOT_NAMES: Record<ItemType, string> = {
  weapon: "Оружие",
  helmet: "Шлем",
  armor: "Броня",
  belt: "Пояс",
  legs: "Штаны",
  accessory: "Аксессуар",
  potion: "Зелье",
  shield: "Щит",
  offhand: "Левая рука",
};

interface InventoryItemCardProps {
  invItem: InventoryItem;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onEquip?: () => void;
  onSell?: (e: React.MouseEvent) => void;
}

export function InventoryItemCard({
  invItem,
  isDragging,
  onDragStart,
  onDragEnd,
  onEquip,
  onSell,
}: InventoryItemCardProps) {
  const sellPrice = Math.floor(invItem.item.price * 0.5);

  return (
    <div
      className={`border-3 border-[#2C2D33] rounded-lg bg-[#1A1B21] p-3 relative shadow-lg transition-all ${
        isDragging ? "opacity-50 scale-95" : "hover:border-[#B21E2C]/60"
      }`}
      style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.6)" }}
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="text-2xl">{SLOT_ICONS[invItem.item.type]}</div>
        <div
          className="px-2 py-1 border-2 border-[#2C2D33] rounded bg-[#111215] text-[#E6E6E6] text-[10px] uppercase tracking-wider"
          style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}
        >
          {SLOT_NAMES[invItem.item.type]}
        </div>
      </div>

      {/* Item Name */}
      <div className="text-[#E6E6E6] font-bold text-sm mb-2">
        {invItem.item.name}
        {invItem.enhancement > 0 && (
          <span className="text-[#FFD700] ml-1">+{invItem.enhancement}</span>
        )}
      </div>

      {/* Stats */}
      <div className="text-[11px] text-[#aaa] space-y-1 mb-2">
        {invItem.item.damage > 0 && <div>Урон: {invItem.item.damage}</div>}
        {invItem.item.armor > 0 && <div>Броня: {invItem.item.armor}</div>}
        {invItem.item.bonusStr > 0 && <div>Сила: +{invItem.item.bonusStr}</div>}
        {invItem.item.bonusAgi > 0 && <div>Ловк: +{invItem.item.bonusAgi}</div>}
        {invItem.item.bonusInt > 0 && <div>Инт: +{invItem.item.bonusInt}</div>}

        {(invItem.item.minLevel > 1 ||
          invItem.item.minStrength > 0 ||
          invItem.item.minAgility > 0 ||
          invItem.item.minIntelligence > 0) && (
          <div className="border-t border-[#444] pt-1 mt-2">
            <div className="text-[#f44336] font-bold">Требования:</div>
            {invItem.item.minLevel > 1 && (
              <div>Уровень: {invItem.item.minLevel}</div>
            )}
            {invItem.item.minStrength > 0 && (
              <div>Сила: {invItem.item.minStrength}</div>
            )}
            {invItem.item.minAgility > 0 && (
              <div>Ловкость: {invItem.item.minAgility}</div>
            )}
            {invItem.item.minIntelligence > 0 && (
              <div>Интеллект: {invItem.item.minIntelligence}</div>
            )}
          </div>
        )}
      </div>

      {/* Sell Price */}
      <div
        className="text-[10px] text-[#FFD700] mb-2 pb-2 border-b border-[#2C2D33]"
        style={{ fontFamily: "monospace" }}
      >
        Продажа: {sellPrice} золота
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onEquip}
          className="flex-1 px-3 py-1 border-2 border-[#4CAF50] rounded bg-[#4CAF50]/10 text-[#4CAF50] hover:bg-[#4CAF50]/20 transition-all text-xs uppercase tracking-wider"
          style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}
        >
          Надеть
        </button>
        <button
          onClick={onSell}
          className="flex-1 px-3 py-1 border-2 border-[#FF9800] rounded bg-[#FF9800]/10 text-[#FF9800] hover:bg-[#FF9800]/20 transition-all text-xs uppercase tracking-wider"
          style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}
        >
          Продать
        </button>
      </div>
    </div>
  );
}
