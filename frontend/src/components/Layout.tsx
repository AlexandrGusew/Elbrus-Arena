import { Outlet } from 'react-router-dom';
import { GameViewport } from './GameViewport';

const Layout = () => {
  return (
    <GameViewport targetWidth={1366} targetHeight={768}>
      <Outlet />
    </GameViewport>
  );
};

export default Layout;