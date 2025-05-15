import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState(''); // Changed from username to email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth(); // Use isLoading from context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic email validation
    if (!email.includes('@')) {
        setError('Anna kelvollinen sähköpostiosoite.');
        return;
    }

    const success = await login(email, password);
    if (!success) {
      setError('Virheellinen sähköpostiosoite tai salasana. Varmista, että käyttäjätunnus on luotu Supabasessa.');
    }
    // Navigation will be handled by useEffect in LoginPage based on isAuthenticated
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-orange-500 p-4 rounded-full mb-4">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-gray-900 text-2xl font-bold">Tervetuloa</h1>
        <p className="text-gray-600 text-center mt-1">
          Kirjaudu sisään sähköpostilla ja salasanalla jatkaaksesi
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Sähköposti
          </label>
          <input
            id="email"
            type="email" // Changed to email
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Salasana
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
            required
            autoComplete="current-password"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${
            isLoading
              ? 'bg-orange-400 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {isLoading ? 'Kirjaudutaan...' : 'Kirjaudu sisään'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
