import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Gebruikersnaam is verplicht';
    if (!password) newErrors.password = 'Wachtwoord is verplicht';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const user = await login(username, password);

      // Navigate based on role
      if (user.role === 'HR') {
        navigate('/hr/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setErrors({ general: 'Inloggen mislukt. Controleer je gegevens.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <Card className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Overuren Systeem</h1>
          <p className="text-text-secondary">Log in om verder te gaan</p>
        </div>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-error bg-opacity-20 border border-error text-error px-4 py-3 rounded-lg mb-4">
              {errors.general}
            </div>
          )}

          <Input
            label="Gebruikersnaam"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="jan1"
            error={errors.username}
            required
          />

          <Input
            label="Wachtwoord"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            error={errors.password}
            required
          />

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full mt-6"
          >
            {loading ? 'Bezig met inloggen...' : 'Inloggen'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-text-secondary">
          <p>Test accounts:</p>
          <p className="mt-2">
            <strong>HR:</strong> linda / Welkom123!<br />
            <strong>Medewerker:</strong> jan1 / Welkom123!
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
