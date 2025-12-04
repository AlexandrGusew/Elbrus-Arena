import { StoneCornerDecorations } from "./StoneCornerDecorations";

interface MainMenuButtonProps {
  label: string;
  onClick?: () => void;
}

export function MainMenuButton({ label, onClick }: MainMenuButtonProps) {
  return (
    <div
      onClick={onClick}
      className="border-4 border-[#2C2D33] rounded-lg bg-[#1A1B21] flex items-center justify-center relative hover:border-[#B21E2C] hover:shadow-[0_0_20px_rgba(178,30,44,0.3)] transition-all cursor-pointer group shadow-lg"
      style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.6)" }}
    >
      <StoneCornerDecorations size="small" hoverColor="#B21E2C" />

      <h3
        className="text-3xl uppercase tracking-[0.3em] text-[#E6E6E6] group-hover:text-[#B21E2C] transition-colors"
        style={{
          fontFamily: "serif",
          textShadow: "0 2px 4px rgba(0,0,0,0.8)",
        }}
      >
        {label}
      </h3>
    </div>
  );
}
