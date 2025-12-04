import type { InventoryItem, ItemType } from "../../../types/api";

const SLOT_NAMES_RU: Record<ItemType, string> = {
  weapon: "МЕЧ",
  helmet: "ШЛЕМ",
  armor: "БРОНЯ",
  belt: "ПОЯС",
  legs: "ШТАНЫ",
  accessory: "КОЛЬЦО",
  potion: "ЗЕЛЬЕ",
  shield: "ЩИТ",
  offhand: "ЛЕВАЯ РУКА",
};

interface EquipmentSlotProps {
  slotType: ItemType;
  equippedItem?: InventoryItem | null;
  isDragOver?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  onClick?: () => void;
}

export function EquipmentSlot({
  slotType,
  equippedItem,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
}: EquipmentSlotProps) {
  return (
    <div
      className={`border-3 rounded bg-[#111215] flex flex-col items-center justify-center text-[10px] text-[#E6E6E6] uppercase tracking-wider hover:border-[#B21E2C]/60 hover:shadow-[0_0_10px_rgba(178,30,44,0.3)] transition-all cursor-pointer aspect-square w-20 h-20 shadow-md ${
        isDragOver ? "border-[#4CAF50] scale-105" : "border-[#2C2D33]"
      }`}
      style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.8)" }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
    >
      {equippedItem ? (
        <>
          <div className="text-[#4CAF50] font-bold">
            {equippedItem.item.name}
          </div>
          {equippedItem.enhancement > 0 && (
            <div className="text-[#FFD700] text-[8px]">
              +{equippedItem.enhancement}
            </div>
          )}
        </>
      ) : (
        <div className="text-[#666]">{SLOT_NAMES_RU[slotType]}</div>
      )}
    </div>
  );
}
