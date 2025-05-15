import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MessageProvider } from './contexts/MessageContext';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import './index.css';
import { useAuth } from './contexts/AuthContext'; // Import useAuth

// ProtectedRoute component
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-white">Ladataan...</p></div>; // Or a spinner component
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};


function AppContent() {
  // useAuth can be called here because AppContent is a child of AuthProvider
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
    <Router basename="/modern-message-viewer/"> {/* Ensure basename matches vite.config.ts */}
      <AuthProvider>
        <MessageProvider>
          <AppContent />
        </MessageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
