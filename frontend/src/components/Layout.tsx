import { Outlet } from 'react-router-dom';
import { GameViewport } from './GameViewport';

const Layout = () => {
  return (
    <GameViewport targetWidth={1440} targetHeight={1080}>
      <Outlet />
    </GameViewport>
  );
};

export default Layout;