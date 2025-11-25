import React from "react";
import {
  WearwolfIdle,
  WearwolfWalk,
  WearwolfAttack1,
  WearwolfAttack2,
  WearwolfAttack3,
  WearwolfDead
} from "./index";

export function WearwolfAnimationsDemo() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      padding: "20px",
      backgroundColor: "#1a1a2e",
      minHeight: "100vh"
    }}>
      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Покой</h3>
        <WearwolfIdle />
      </div>

      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Ходьба</h3>
        <WearwolfWalk />
      </div>

      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Удар когтями</h3>
        <WearwolfAttack1 />
      </div>

      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Рывок</h3>
        <WearwolfAttack2 />
      </div>

      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Дикая атака</h3>
        <WearwolfAttack3 />
      </div>

      <div style={{
        backgroundColor: "#16213e",
        borderRadius: "8px",
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Смерть</h3>
        <WearwolfDead />
      </div>
    </div>
  );
}
