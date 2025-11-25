import { useState } from "react";
import "./yuokai-animations.css";

export function YuokaiIdle() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "yuokai-animation yuokai-idle " +
          (isPlaying ? "yuokai-idle--playing" : "")
        }
      />
      <button onClick={() => setIsPlaying(!isPlaying)} style={{ marginTop: 16 }}>
        {isPlaying ? "Остановить" : "Запустить"}
      </button>
    </div>
  );
}
