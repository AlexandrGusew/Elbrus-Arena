interface TopNavigationProps {
  musicOn: boolean;
  onToggleMusic: () => void;
  onNavigate: (page: "login" | "create" | "choose" | "dashboard") => void;
}

export function TopNavigation({
  musicOn,
  onToggleMusic,
  onNavigate,
}: TopNavigationProps) {
  return (
    <div className="absolute top-6 right-6 flex gap-2 z-30">
      <button
        onClick={onToggleMusic}
        className="px-4 py-2 border-3 border-[#2C2D33] rounded bg-[#1A1B21] hover:bg-[#1A1B21] hover:border-[#B21E2C]/60 text-[#E6E6E6] hover:text-[#B21E2C] transition-all text-xs uppercase tracking-[0.15em] shadow-lg"
        style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}
      >
        Music
      </button>
      <button
        className="px-4 py-2 border-3 border-[#2C2D33] rounded bg-[#1A1B21] hover:bg-[#1A1B21] hover:border-[#B21E2C]/60 text-[#E6E6E6] hover:text-[#B21E2C] transition-all text-xs uppercase tracking-[0.15em] shadow-lg"
        style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}
      >
        FAQ
      </button>
      <button
        onClick={() => onNavigate("choose")}
        className="px-4 py-2 border-3 border-[#2C2D33] rounded bg-[#1A1B21] hover:bg-[#1A1B21] hover:border-[#B21E2C]/60 text-[#E6E6E6] hover:text-[#B21E2C] transition-all text-xs uppercase tracking-[0.15em] shadow-lg"
        style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}
      >
        Back
      </button>
    </div>
  );
}
