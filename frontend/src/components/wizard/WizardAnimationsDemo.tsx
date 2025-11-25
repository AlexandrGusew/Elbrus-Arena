import React from "react";
import { 
  WizardIdle, 
  WizardWalk, 
  WizardAttack1, 
  WizardAttack2, 
  WizardDead 
} from "./index";

export function WizardAnimationsDemo() {
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
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Медитация</h3>
        <WizardIdle />
      </div>
      
      <div style={{ 
        backgroundColor: "#16213e", 
        borderRadius: "8px", 
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Левитация</h3>
        <WizardWalk />
      </div>
      
      <div style={{ 
        backgroundColor: "#16213e", 
        borderRadius: "8px", 
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Магическая стрела</h3>
        <WizardAttack1 />
      </div>
      
      <div style={{ 
        backgroundColor: "#16213e", 
        borderRadius: "8px", 
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Огненный шар</h3>
        <WizardAttack2 />
      </div>
      
      <div style={{ 
        backgroundColor: "#16213e", 
        borderRadius: "8px", 
        padding: "16px",
        textAlign: "center",
        border: "2px solid #0f3460"
      }}>
        <h3 style={{ color: "#e94560", marginBottom: "16px" }}>Смерть мага</h3>
        <WizardDead />
      </div>
    </div>
  );
}

