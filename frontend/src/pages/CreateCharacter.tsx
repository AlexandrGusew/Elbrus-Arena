import { useNavigate } from 'react-router-dom';

const CreateCharacter = () => {
  const navigate = useNavigate();

  const handleCreate = () => {
    navigate('/dashboard');
  };

  return (
    <div style={{ padding: '25px' }}>
      <h1>Create Character</h1>
      <button onClick={handleCreate}>Create Character</button>
    </div>
  );
};

export default CreateCharacter;