import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>[Stamina: 100] Character Info</p>
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Link to="/pvp"><button>PvP</button></Link>
        <Link to="/dungeon"><button>Dungeon</button></Link>
        <Link to="/blacksmith"><button>Blacksmith</button></Link>
      </div>
    </div>
  );
};

export default Dashboard;