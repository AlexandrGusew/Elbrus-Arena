import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CHARACTER_CLASSES } from '../types/api';
import type { CharacterClass, Character } from '../types/api';
import { styles } from './CreateCharacter.styles';

const CLASS_INFO = {
  warrior: { name: 'Воин', stats: 'Сила: 15, Ловкость: 8, Интеллект: 5, HP: 150' },
  mage: { name: 'Маг', stats: 'Сила: 5, Ловкость: 10, Интеллект: 15, HP: 120' },
  assassin: { name: 'Ассасин', stats: 'Сила: 8, Ловкость: 15, Интеллект: 8, HP: 100' },
};

const CreateCharacter = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('warrior');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Введите имя персонажа');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Генерируем случайный telegramId для теста (в проде это придет из Telegram)
      const fakeTelegramId = Math.floor(Math.random() * 1000000000);

      const response = await api.post<Character>('/character', {
        telegramId: fakeTelegramId,
        name: name.trim(),
        class: selectedClass,
      });

      const character = response.data;

      localStorage.setItem('characterId', character.id.toString());

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Ошибка при создании персонажа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Создание персонажа</h1>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Имя персонажа:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введите имя"
          style={styles.input}
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.classLabel}>Выберите класс:</label>

        {CHARACTER_CLASSES.map((cls) => (
          <div
            key={cls}
            onClick={() => setSelectedClass(cls)}
            style={{
              ...styles.classCard,
              ...(selectedClass === cls ? styles.classCardSelected : styles.classCardDefault),
            }}
          >
            <div style={styles.className}>{CLASS_INFO[cls].name}</div>
            <div style={styles.classStats}>{CLASS_INFO[cls].stats}</div>
          </div>
        ))}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <button
        onClick={handleCreate}
        disabled={loading}
        style={{
          ...styles.button,
          ...(loading ? styles.buttonDisabled : styles.buttonActive),
        }}
      >
        {loading ? 'Создание...' : 'Создать персонажа'}
      </button>
    </div>
  );
};

export default CreateCharacter;