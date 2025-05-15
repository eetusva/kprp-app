import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import MessageList from '../components/MessageList';
import MessageForm from '../components/MessageForm';

const AdminPage: React.FC = () => {
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {userRole === 'admin' && (
          <div className="p-4 bg-gray-800 text-white">
            <h2 className="text-xl font-semibold">Admin Controls</h2>
            <p className="text-sm text-gray-400">User management features will be added here.</p>
            {/* Placeholder for user management UI */}
          </div>
        )}
        <MessageList />
        {userRole === 'admin' && <MessageForm />}
      </div>
    </Layout>
  );
};

export default AdminPage;
