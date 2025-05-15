import React, { useState, useEffect } from 'react';
import { Send, Plus, Smile } from 'lucide-react';
import { useMessages } from '../contexts/MessageContext';
import { useAuth } from '../contexts/AuthContext';
import { Profile } from '../types'; // Use Profile type

const MessageForm: React.FC = () => {
  const [content, setContent] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null); // Store ID
  const [showUserSelector, setShowUserSelector] = useState(false);
  
  const { addMessage, users: availableUsers } = useMessages(); // Get users (profiles) from context
  const { user: currentUser } = useAuth(); // Current authenticated user

  // Find the full profile object for the selected user ID
  const selectedUserProfile = availableUsers.find(u => u.id === selectedUserId);

  // Automatically select the current authenticated admin user if they are an admin
  // and no user is currently selected for posting.
  useEffect(() => {
    if (currentUser?.profile?.role === 'admin' && !selectedUserId && availableUsers.length > 0) {
      // Check if current admin is in the list of available users (profiles)
      const adminProfile = availableUsers.find(u => u.id === currentUser.id && u.role === 'admin');
      if (adminProfile) {
        setSelectedUserId(adminProfile.id);
      }
    }
  }, [currentUser, selectedUserId, availableUsers]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && selectedUserId) {
      await addMessage(content, selectedUserId);
      setContent('');
      // Optionally, clear selected user or keep it for next message
      // setSelectedUserId(null); 
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-[#36393f] p-4 border-t border-[#2d2f34]">
      {selectedUserProfile && (
        <div className="flex items-center mb-2 bg-[#2f3136] p-2 rounded">
          <img
            src={selectedUserProfile.avatar_url || `https://via.placeholder.com/128?text=${selectedUserProfile.username?.charAt(0)}`}
            alt={selectedUserProfile.username}
            className="w-6 h-6 rounded-full mr-2 object-cover"
          />
          <span className="text-[#b9bbbe] text-sm">
            Posting as: <span className="text-white">{selectedUserProfile.username}</span>
          </span>
          <button 
            onClick={() => setSelectedUserId(null)}
            className="ml-auto text-[#b9bbbe] hover:text-white"
            title="Clear selected user"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <button
          type="button"
          onClick={() => setShowUserSelector(!showUserSelector)}
          className="absolute left-3 top-3 text-[#b9bbbe] hover:text-white transition-colors"
          title="Select user to post as"
        >
          <Plus size={20} />
        </button>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedUserId ? `Message as ${selectedUserProfile?.username || 'selected user'}` : "Select a user to post as first"}
          disabled={!selectedUserId || currentUser?.profile?.role !== 'admin'} // Only admin can post for now
          className="w-full px-12 py-3 bg-[#40444b] text-white placeholder:text-slate-400 rounded-lg focus:outline-none resize-none min-h-[44px] max-h-32"
          rows={1}
        />

        <button
          type="button"
          className="absolute right-12 top-3 text-[#b9bbbe] hover:text-white transition-colors"
        >
          <Smile size={20} />
        </button>

        <button
          type="submit"
          disabled={!content.trim() || !selectedUserId || currentUser?.profile?.role !== 'admin'}
          className={`absolute right-3 top-3 transition-colors ${
            content.trim() && selectedUserId && currentUser?.profile?.role === 'admin'
              ? 'text-white hover:text-[#b9bbbe]'
              : 'text-[#4f545c]'
          }`}
        >
          <Send size={20} />
        </button>

        {showUserSelector && currentUser?.profile?.role === 'admin' && (
          <div className="absolute bottom-full left-0 mb-2 bg-[#2f3136] rounded-md shadow-lg overflow-hidden w-64 z-10">
            <div className="p-2 border-b border-[#222428]">
              <h3 className="text-[#b9bbbe] text-xs font-semibold">SELECT USER TO POST AS</h3>
            </div>
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {availableUsers.map((userOption: Profile) => (
                <div
                  key={userOption.id}
                  className={`p-2 hover:bg-[#36393f] cursor-pointer flex items-center ${selectedUserId === userOption.id ? 'bg-[#3c3f45]' : ''}`}
                  onClick={() => {
                    setSelectedUserId(userOption.id);
                    setShowUserSelector(false);
                  }}
                >
                  <img
                    src={userOption.avatar_url || `https://via.placeholder.com/128?text=${userOption.username?.charAt(0)}`}
                    alt={userOption.username}
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  <span className="text-white">{userOption.username} ({userOption.role})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default MessageForm;
