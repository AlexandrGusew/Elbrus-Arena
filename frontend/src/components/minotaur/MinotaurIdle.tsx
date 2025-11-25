import { useState } from "react";
import "./minotaur-animations.css";

export function MinotaurIdle() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "minotaur-animation minotaur-idle " +
          (isPlaying ? "minotaur-idle--playing" : "")
        }
      />
      <button onClick={() => setIsPlaying(!isPlaying)} style={{ marginTop: 16 }}>
        {isPlaying ? "Остановить" : "Запустить"}
      </button>
    </div>
  );
}
