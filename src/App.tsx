import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MessageProvider } from './contexts/MessageContext';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import './index.css';
import { useAuth } from './contexts/AuthContext';

// ProtectedRoute component
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-white">Ladataan...</p></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};


function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-white">Ladataan käyttäjätietoja...</p></div>;
  }
  
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router basename="/kprp-app/"> {/* Updated basename */}
      <AuthProvider>
        <MessageProvider>
          <AppContent />
        </MessageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
