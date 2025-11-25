import { useCharacter } from '../hooks/useCharacter';

const Blacksmith = () => {
  const { character, loading } = useCharacter();

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
  }

  if (!character) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Персонаж не найден</div>;
  }

  return (
    <div style={{ padding: '25px' }}>
      <h1>Blacksmith</h1>
      <p>Blacksmith content here</p>
    </div>
  );
};

export default Blacksmith;