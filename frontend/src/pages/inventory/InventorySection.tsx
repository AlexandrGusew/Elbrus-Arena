import { InventoryItemsList } from "./components";
import type { Character, InventoryItem } from "../../types/api";

interface InventorySectionProps {
  character: Character;
  draggedItem: InventoryItem | null;
  onDragStart: (e: React.DragEvent, invItem: InventoryItem) => void;
  onDragEnd: () => void;
  onEquip: (invItem: InventoryItem) => void;
  onSell: (invItem: InventoryItem, e: React.MouseEvent) => void;
  onNavigateToForge: () => void;
  showForge: boolean;
  onNavigateToInventory: () => void;
}

export function InventorySection({
  character,
  draggedItem,
  onDragStart,
  onDragEnd,
  onEquip,
  onSell,
  onNavigateToForge,
}: InventorySectionProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 p-4 border-b-2 border-[#2C2D33]">
        <h2
          className="text-2xl uppercase tracking-[0.2em] text-[#E6E6E6]"
          style={{
            fontFamily: "serif",
            textShadow: "0 2px 4px rgba(0,0,0,0.8)",
          }}
        >
          Инвентарь ({character.inventory.items.filter((i) => !i.isEquipped).length} / {character.inventory.size})
        </h2>
        <div className="text-[#FFD700]" style={{ fontFamily: "serif" }}>
          Золото: {character.gold}
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-hidden">
        <InventoryItemsList
          character={character}
          draggedItem={draggedItem}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onEquip={onEquip}
          onSell={onSell}
        />
      </div>
    </div>
  );
}
