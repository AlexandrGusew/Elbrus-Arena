import { MainMenuButton } from "./MainMenuButton";

interface MainMenuProps {
  onInventoryClick: () => void;
}

export function MainMenu({ onInventoryClick }: MainMenuProps) {
  return (
    <div className="grid grid-rows-4 gap-4 h-full">
      <MainMenuButton label="Arena" />
      <MainMenuButton label="Dange" />
      <MainMenuButton label="Inventory" onClick={onInventoryClick} />
      <MainMenuButton label="Forge" />
    </div>
  );
}
