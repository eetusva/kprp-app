import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-800 to-orange-900">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-orange-600">Ylläpitohakemukset Season 5</h1>
        </div>
        <button
          onClick={logout}
          className="flex items-center px-4 py-2 text-orange-600 hover:text-orange-700 transition-colors"
        >
          <LogOut size={18} className="mr-2" />
          <span>Kirjaudu ulos</span>
        </button>
      </header>
      
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default Layout;
