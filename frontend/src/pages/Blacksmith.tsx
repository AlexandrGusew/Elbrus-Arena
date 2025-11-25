import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCharacter } from '../hooks/useCharacter';
import type { Character, InventoryItem } from '../types/api';
import { styles } from './Blacksmith.styles';

const Blacksmith = () => {
  const { character, setCharacter, loading } = useCharacter();

  const handleEquip = async (invItem: InventoryItem) => {
    if (!character) return;

    try {
      const endpoint = invItem.isEquipped
        ? `/character/${character.id}/unequip/${invItem.id}`
        : `/character/${character.id}/equip/${invItem.id}`;

      const { data: updatedCharacter } = await api.put<Character>(endpoint);

      setCharacter(updatedCharacter);
    } catch (err: any) {
    }
  };

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