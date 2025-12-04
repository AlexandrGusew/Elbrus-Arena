import { StoneCornerDecorations } from "./StoneCornerDecorations";

const CHAT_TABS = [
  { id: 1, label: "All", isActive: true },
  { id: 2, label: "Privat", isActive: false },
  { id: 3, label: "Banlist", isActive: false },
  { id: 4, label: "Frendlist", isActive: false },
];

export function ChatSection() {
  return (
    <div
      className="border-4 border-[#2C2D33] rounded-lg bg-[#1A1B21] flex flex-col relative h-[33%] shadow-lg"
      style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.6)" }}
    >
      <StoneCornerDecorations size="small" />

      {/* Chat Area */}
      <div className="flex-1 flex items-center justify-center p-6">
        <h3
          className="text-4xl uppercase tracking-[0.3em] text-[#E6E6E6]/20"
          style={{ fontFamily: "serif" }}
        >
          CHAT
        </h3>
      </div>

      {/* Chat Tabs */}
      <div className="grid grid-cols-4 gap-2 p-3 border-t-2 border-[#2C2D33]">
        {CHAT_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`px-2 py-2 rounded text-xs uppercase tracking-wider shadow-md ${
              tab.isActive
                ? "border-3 border-[#B21E2C] bg-[#B21E2C]/10 text-[#E6E6E6]"
                : "border-2 border-[#2C2D33] bg-[#111215] text-[#E6E6E6]/60 hover:text-[#E6E6E6] hover:border-[#B21E2C]/40 transition-all"
            }`}
            style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
