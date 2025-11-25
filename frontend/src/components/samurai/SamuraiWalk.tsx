import { useState } from "react";
import "./samurai-animations.css";

export function SamuraiWalk() {
  const [isWalking, setIsWalking] = useState(false);

  return (
    <div style={{ padding: 32 }}>
      <div
        className={
          "samurai-animation samurai-walk " +
          (isWalking ? "samurai-walk--playing" : "")
        }
      />
      <button onClick={() => setIsWalking(!isWalking)} style={{ marginTop: 16 }}>
        {isWalking ? "Остановить" : "Запустить"}
      </button>
    </div>
  );
}
