import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Layout from "./components/Layout";
import CreateCharacter from "./pages/CreateCharacter";
import Dashboard from "./pages/Dashboard";
import PvP from "./pages/PvP";
import Dungeon from "./pages/Dungeon";
import Blacksmith from "./pages/Blacksmith";
import { WarriorAnimationsDemo } from "./components/warrior/WarriorAnimationsDemo";
import { WizardAnimationsDemo } from "./components/wizard/WizardAnimationsDemo";
import { SamuraiAnimationsDemo } from "./components/samurai/SamuraiAnimationsDemo";
import { MinotaurAnimationsDemo } from "./components/minotaur/MinotaurAnimationsDemo";
import { YuokaiAnimationsDemo } from "./components/yuokai/YuokaiAnimationsDemo";
import { WearwolfAnimationsDemo } from "./components/wearwolf/WearwolfAnimationsDemo";
import { SatyrAnimationsDemo } from "./components/satyr/SatyrAnimationsDemo";

if (!localStorage.getItem("auth_token")) {
  const fakeToken = "dev-fake-token-" + Date.now();
  localStorage.setItem("auth_token", fakeToken);
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <CreateCharacter />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "pvp",
        element: <PvP />,
      },
      {
        path: "dungeon",
        element: <Dungeon />,
      },
      {
        path: "blacksmith",
        element: <Blacksmith />,
      },
      {
        path: "warrior",
        element: <WarriorAnimationsDemo />,
      },
      {
        path: 'wizard',
        element: <WizardAnimationsDemo />,
      },
      {
        path: "samurai",
        element: <SamuraiAnimationsDemo />,
      },
      {
        path: "minotaur",
        element: <MinotaurAnimationsDemo />,
      },
      {
        path: "yuokai",
        element: <YuokaiAnimationsDemo />,
      },
      {
        path: "wearwolf",
        element: <WearwolfAnimationsDemo />,
      },
      {
        path: "satyr",
        element: <SatyrAnimationsDemo />,
      }
    ],
  },
  {
    path: "*",
    element: (
      <div style={{ padding: "50px", textAlign: "center" }}>
        404 - Page Not Found
      </div>
    ),
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
