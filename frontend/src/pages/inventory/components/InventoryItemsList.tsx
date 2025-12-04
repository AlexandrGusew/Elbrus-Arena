import { InventoryItemCard } from "./InventoryItemCard";
import type { Character, InventoryItem } from "../../../types/api";

interface InventoryItemsListProps {
  character: Character;
  draggedItem: InventoryItem | null;
  onDragStart: (e: React.DragEvent, invItem: InventoryItem) => void;
  onDragEnd: () => void;
  onEquip: (invItem: InventoryItem) => void;
  onSell: (invItem: InventoryItem, e: React.MouseEvent) => void;
}

export function InventoryItemsList({
  character,
  draggedItem,
  onDragStart,
  onDragEnd,
  onEquip,
  onSell,
}: InventoryItemsListProps) {
  const unequippedItems = character.inventory.items.filter(
    (item) => !item.isEquipped
  );

  if (unequippedItems.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{
          background: "linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)",
          borderRadius: "10px",
          border: "2px solid #4a4a6a",
        }}
      >
        <div className="text-center p-6">
          <div className="text-[#E6E6E6]/40 text-lg mb-2">
            Инвентарь пуст
          </div>
          <div className="text-[#E6E6E6]/20 text-sm">
            Пройдите подземелье, чтобы получить предметы!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {unequippedItems.map((invItem) => (
          <InventoryItemCard
            key={invItem.id}
            invItem={invItem}
            isDragging={draggedItem?.id === invItem.id}
            onDragStart={(e) => onDragStart(e, invItem)}
            onDragEnd={onDragEnd}
            onEquip={() => onEquip(invItem)}
            onSell={(e) => onSell(invItem, e)}
          />
        ))}
      </div>
    </div>
  );
}
