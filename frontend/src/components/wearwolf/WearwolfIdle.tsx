import { useState } from "react";
import "./wearwolf-animations.css";

export function WearwolfIdle() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "wearwolf-animation wearwolf-idle " +
          (isPlaying ? "wearwolf-idle--playing" : "")
        }
      />
      <button onClick={() => setIsPlaying(!isPlaying)} style={{ marginTop: 16 }}>
        {isPlaying ? "Остановить" : "Запустить"}
      </button>
    </div>
  );
}
