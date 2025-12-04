export function CharacterAvatar() {
  return (
    <div
      className="flex-1 w-full rounded-full border-4 border-[#2C2D33] bg-gradient-to-br from-[#1A1B21] via-[#111215] to-[#111215] flex items-center justify-center relative overflow-hidden shadow-lg"
      style={{
        boxShadow:
          "inset 0 0 40px rgba(0,0,0,0.9), 0 4px 15px rgba(0,0,0,0.8)",
      }}
    >
      <div className="absolute top-1/3 left-1/4 w-3 h-3 rounded-full bg-[#B21E2C] blur-sm animate-pulse shadow-[0_0_15px_rgba(178,30,44,0.9)]"></div>
      <div
        className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-[#B21E2C] blur-sm animate-pulse shadow-[0_0_15px_rgba(178,30,44,0.9)]"
        style={{ animationDelay: "0.5s" }}
      ></div>
      <span
        className="text-4xl text-[#E6E6E6] tracking-wider"
        style={{ fontFamily: "serif" }}
      >
        CHAR
      </span>
    </div>
  );
}
