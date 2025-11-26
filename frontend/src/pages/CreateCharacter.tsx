import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCharacterMutation, useGetCharacterByNameQuery } from '../store/api/characterApi';
import { CHARACTER_CLASSES } from '../types/api';
import type { CharacterClass } from '../types/api';
import { styles } from './CreateCharacter.styles';

const CLASS_INFO = {
  warrior: { name: 'Воин', stats: 'Сила: 15, Ловкость: 8, Интеллект: 5, HP: 150' },
  mage: { name: 'Маг', stats: 'Сила: 5, Ловкость: 10, Интеллект: 15, HP: 120' },
  assassin: { name: 'Ассасин', stats: 'Сила: 8, Ловкость: 15, Интеллект: 8, HP: 100' },
};

const CreateCharacter = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const [loginName, setLoginName] = useState('');
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('warrior');
  const [error, setError] = useState('');

  const [createCharacter, { isLoading }] = useCreateCharacterMutation();
  const [searchName, setSearchName] = useState<string | null>(null);

  const { data: foundCharacter, isLoading: isSearching, isError, isSuccess } = useGetCharacterByNameQuery(
    searchName || '',
    { skip: !searchName }
  );

  // Отслеживаем результат поиска
  useEffect(() => {
    if (searchName && isSuccess) {
      if (foundCharacter) {
        localStorage.setItem('characterId', foundCharacter.id.toString());
        navigate('/dashboard');
      } else {
        setError('Персонаж не найден');
        setSearchName(null);
      }
    }
  }, [foundCharacter, isSuccess, searchName, navigate]);

  const handleLogin = async () => {
    if (!loginName.trim()) {
      setError('Введите имя персонажа');
      return;
    }

    setError('');
    setSearchName(loginName.trim());
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Введите имя персонажа');
      return;
    }

    setError('');

    try {
      // Генерируем случайный telegramId для теста (в проде это придет из Telegram)
      const fakeTelegramId = Math.floor(Math.random() * 1000000000);

      const character = await createCharacter({
        telegramId: fakeTelegramId,
        name: name.trim(),
        class: selectedClass,
      }).unwrap();

      localStorage.setItem('characterId', character.id.toString());

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.data?.message || err.message || 'Ошибка при создании персонажа');
    }
  };

  return (
    <div style={styles.container}>
      <h1>{mode === 'login' ? 'Вход в игру' : 'Создание персонажа'}</h1>

      {/* Переключатель режимов */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => {
            setMode('login');
            setError('');
          }}
          style={{
            ...styles.button,
            ...(mode === 'login' ? styles.buttonActive : styles.buttonDisabled),
            flex: 1,
          }}
        >
          Войти
        </button>
        <button
          onClick={() => {
            setMode('create');
            setError('');
          }}
          style={{
            ...styles.button,
            ...(mode === 'create' ? styles.buttonActive : styles.buttonDisabled),
            flex: 1,
          }}
        >
          Создать
        </button>
      </div>

      {mode === 'login' ? (
        /* Форма входа */
        <>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Имя персонажа:</label>
            <input
              type="text"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              placeholder="Введите имя персонажа"
              style={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            onClick={handleLogin}
            disabled={isSearching}
            style={{
              ...styles.button,
              ...(isSearching ? styles.buttonDisabled : styles.buttonActive),
            }}
          >
            {isSearching ? 'Поиск...' : 'Войти'}
          </button>
        </>
      ) : (
        /* Форма создания */
        <>
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
            disabled={isLoading}
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonDisabled : styles.buttonActive),
            }}
          >
            {isLoading ? 'Создание...' : 'Создать персонажа'}
          </button>
        </>
      )}
    </div>
  );
};

export default CreateCharacter;