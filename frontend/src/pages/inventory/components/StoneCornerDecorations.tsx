interface StoneCornerDecorationsProps {
  size?: "small" | "large";
  color?: string;
  hoverColor?: string;
}

export function StoneCornerDecorations({
  size = "small",
  color = "#2C2D33",
  hoverColor,
}: StoneCornerDecorationsProps) {
  const sizeClass = size === "small" ? "w-4 h-4" : "w-12 h-12";
  const borderWidth = size === "small" ? "border-t-4 border-l-4" : "border-t-4 border-l-4";
  const baseColorClass = `border-[${color}]`;
  const hoverColorClass = hoverColor ? `group-hover:border-[${hoverColor}]` : "";
  const transitionClass = hoverColor ? "transition-all" : "";

  return (
    <>
      <div
        className={`absolute -top-1 -left-1 ${sizeClass} ${borderWidth} ${baseColorClass} ${hoverColorClass} ${transitionClass}`}
      ></div>
      <div
        className={`absolute -top-1 -right-1 ${sizeClass} border-t-4 border-r-4 ${baseColorClass} ${hoverColorClass} ${transitionClass}`}
      ></div>
      <div
        className={`absolute -bottom-1 -left-1 ${sizeClass} border-b-4 border-l-4 ${baseColorClass} ${hoverColorClass} ${transitionClass}`}
      ></div>
      <div
        className={`absolute -bottom-1 -right-1 ${sizeClass} border-b-4 border-r-4 ${baseColorClass} ${hoverColorClass} ${transitionClass}`}
      ></div>
    </>
  );
}
