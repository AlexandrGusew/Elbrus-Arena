import { useState } from "react";
import "./satyr-animations.css";

export function SatyrIdle() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "satyr-animation satyr-idle " +
          (isPlaying ? "satyr-idle--playing" : "")
        }
      />
      <button onClick={() => setIsPlaying(!isPlaying)} style={{ marginTop: 16 }}>
        {isPlaying ? "Остановить" : "Запустить"}
      </button>
    </div>
  );
}
