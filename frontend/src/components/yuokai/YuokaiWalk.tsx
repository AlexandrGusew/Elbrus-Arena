import { useState } from "react";
import "./yuokai-animations.css";

export function YuokaiWalk() {
  const [isWalking, setIsWalking] = useState(false);

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "yuokai-animation yuokai-walk " +
          (isWalking ? "yuokai-walk--playing" : "")
        }
      />
      <button onClick={() => setIsWalking(!isWalking)} style={{ marginTop: 16 }}>
        {isWalking ? "Остановить" : "Запустить"}
      </button>
    </div>
  );
}
