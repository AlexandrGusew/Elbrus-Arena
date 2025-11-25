import { useState } from "react";
import "./minotaur-animations.css";

export function MinotaurWalk() {
  const [isWalking, setIsWalking] = useState(false);

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "minotaur-animation minotaur-walk " +
          (isWalking ? "minotaur-walk--playing" : "")
        }
      />
      <button onClick={() => setIsWalking(!isWalking)} style={{ marginTop: 16 }}>
        {isWalking ? "Остановить" : "Запустить"}
      </button>
    </div>
  );
}
