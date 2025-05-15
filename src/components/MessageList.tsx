import React, { useRef, useEffect, useState } from 'react';
import { useMessages } from '../contexts/MessageContext';
import { useAuth } from '../contexts/AuthContext';
import { Profile, Message as MessageType } from '../types';
import { ChevronDown, ChevronUp, Edit3, Trash2, Save, XCircle, UserCog } from 'lucide-react';

const MessageList: React.FC = () => {
  const { messages, editMessage, deleteMessage, editUserUsername, editUserAvatar } = useMessages();
  const { user: currentUser, userRole } = useAuth(); // currentUser from useAuth
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  
  const [editingUserDetailsForUserId, setEditingUserDetailsForUserId] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);

  const currentDisplayMessage: MessageType | undefined = messages[currentIndex];
  // The user profile for the current message is now nested under `currentDisplayMessage.profiles`
  const currentMessageUserProfile: Profile | undefined = currentDisplayMessage?.profiles;


  const hasNextMessage = currentIndex < messages.length - 1;
  const hasPreviousMessage = currentIndex > 0;

  const isEditingAnyField = !!editingMessageId || !!editingUserDetailsForUserId;

  const handleScroll = (direction: 'up' | 'down') => {
    if (isEditingAnyField) return;
    if (direction === 'down' && hasNextMessage) {
      setCurrentIndex(prev => prev + 1);
    } else if (direction === 'up' && hasPreviousMessage) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (messages.length > 0 && currentIndex >= messages.length) {
      setCurrentIndex(messages.length - 1);
    } else if (messages.length === 0) {
      setCurrentIndex(0);
    }
  }, [messages, currentIndex]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isEditingAnyField) return;
      if (e.deltaY > 0) handleScroll('down');
      else handleScroll('up');
    };

    const container = containerRef.current;
    if (container) container.addEventListener('wheel', handleWheel);
    return () => {
      if (container) container.removeEventListener('wheel', handleWheel);
    };
  }, [currentIndex, messages.length, isEditingAnyField, hasNextMessage, hasPreviousMessage]);

  const handleEditMessage = (message: MessageType) => {
    setEditingMessageId(message.id);
    setEditText(message.content);
    setEditingUserDetailsForUserId(null);
  };

  const handleSaveEditMessage = async () => {
    if (editingMessageId) {
      await editMessage(editingMessageId, editText);
      setEditingMessageId(null);
      setEditText('');
    }
  };

  const handleCancelEditMessage = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Haluatko varmasti poistaa tämän viestin?')) {
      await deleteMessage(id);
      // Recalculate index after deletion
      if (messages.length -1 <= 0) { // if it was the last message or becomes empty
        setCurrentIndex(0);
      } else if (currentIndex >= messages.length - 1) { // if current was last
         setCurrentIndex(Math.max(0, messages.length - 2)); // go to new last
      }
      // No change if deleting from middle and list is not empty
    }
  };

  const handleEditUserDetails = (userProfile: Profile) => {
    setEditingUserDetailsForUserId(userProfile.id);
    setNewUsername(userProfile.username);
    setNewAvatarUrl(userProfile.avatar_url || '');
    setEditingMessageId(null);
  };

  const handleSaveUserDetails = async () => {
    if (editingUserDetailsForUserId && currentMessageUserProfile) {
      let usernameChanged = false;
      let avatarChanged = false;

      if (newUsername.trim() && newUsername.trim() !== currentMessageUserProfile.username) {
        await editUserUsername(editingUserDetailsForUserId, newUsername.trim());
        usernameChanged = true;
      }
      if (newAvatarUrl.trim() && newAvatarUrl.trim() !== (currentMessageUserProfile.avatar_url || '')) {
        if (newAvatarUrl.trim().toLowerCase().startsWith('http://') || newAvatarUrl.trim().toLowerCase().startsWith('https://')) {
            await editUserAvatar(editingUserDetailsForUserId, newAvatarUrl.trim());
            avatarChanged = true;
        } else {
            alert("Virheellinen profiilikuvan URL. Varmista, että se alkaa http:// tai https://");
            return; 
        }
      }
      if(usernameChanged || avatarChanged) {
        // Data should refresh via subscription or manual refetch in context
      }
      setEditingUserDetailsForUserId(null);
      setNewUsername('');
      setNewAvatarUrl('');
    }
  };

  const handleCancelEditUserDetails = () => {
    setEditingUserDetailsForUserId(null);
    setNewUsername('');
    setNewAvatarUrl('');
  };
  
  useEffect(() => { // Ensure currentIndex is valid after messages array changes (e.g., deletion)
    if (messages.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= messages.length) {
      setCurrentIndex(Math.max(0, messages.length - 1));
    }
  }, [messages.length]);


  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <p className="text-white text-center">Ei viestejä. Admin voi aloittaa keskustelun!</p>
      </div>
    );
  }
  
  if (!currentDisplayMessage || !currentMessageUserProfile) {
    // This can happen if messages are empty or data is still loading
    // or if a message somehow doesn't have its profile joined (should not happen with current query)
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <p className="text-white text-center">Ladataan viestejä tai viestin käyttäjätietoja ei löydy...</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 flex flex-col items-center justify-center relative bg-gradient-to-br from-orange-800 to-orange-900 p-8"
    >
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 transition-all duration-500 transform hover:shadow-xl flex flex-col max-h-[calc(100vh-12rem)]">
        <div className="flex items-start space-x-4">
          <img
            src={currentMessageUserProfile.avatar_url || `https://via.placeholder.com/128?text=${currentMessageUserProfile.username?.charAt(0)}`}
            alt={currentMessageUserProfile.username}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              {editingUserDetailsForUserId === currentMessageUserProfile.id ? (
                <div className="flex-1 space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Käyttäjänimi</label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded-md text-gray-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Profiilikuvan URL (PNG)</label>
                    <input
                      type="text"
                      value={newAvatarUrl}
                      onChange={(e) => setNewAvatarUrl(e.target.value)}
                      placeholder="https://example.com/image.png"
                      className="w-full p-1 border border-gray-300 rounded-md text-gray-700 text-sm"
                    />
                  </div>
                  <div className="mt-1 flex space-x-1">
                    <button
                      onClick={handleSaveUserDetails}
                      className="px-2 py-0.5 bg-green-500 text-white rounded hover:bg-green-600 text-xs flex items-center"
                    >
                      <Save size={12} className="mr-1" /> Tallenna käyttäjätiedot
                    </button>
                    <button
                      onClick={handleCancelEditUserDetails}
                      className="px-2 py-0.5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-xs flex items-center"
                    >
                      <XCircle size={12} className="mr-1" /> Peruuta
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <h3 className="font-semibold text-gray-900">
                    {currentMessageUserProfile.username}
                  </h3>
                  {userRole === 'admin' && !isEditingAnyField && (
                     <button
                        onClick={() => handleEditUserDetails(currentMessageUserProfile)}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                        title="Muokkaa käyttäjätietoja"
                      >
                        <UserCog size={16} />
                      </button>
                  )}
                </div>
              )}
              {userRole === 'admin' && !isEditingAnyField && (
                <div className="flex space-x-2 ml-auto">
                  <button
                    onClick={() => handleEditMessage(currentDisplayMessage)}
                    className="text-orange-500 hover:text-orange-700"
                    title="Muokkaa viestiä"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(currentDisplayMessage.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Poista viesti"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
            
            {editingMessageId === currentDisplayMessage.id ? (
              <div className="mt-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-700 max-h-72 overflow-y-auto custom-scrollbar"
                  rows={5}
                />
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={handleSaveEditMessage}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                  >
                    <Save size={16} className="mr-1" /> Tallenna viesti
                  </button>
                  <button
                    onClick={handleCancelEditMessage}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 flex items-center"
                  >
                    <XCircle size={16} className="mr-1" /> Peruuta
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-gray-700 text-lg whitespace-pre-wrap break-words max-h-72 overflow-y-auto custom-scrollbar">
                {currentDisplayMessage.content}
              </p>
            )}
             <p className="mt-1 text-xs text-gray-500">
              {new Date(currentDisplayMessage.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-20 right-8 flex flex-col gap-2">
        <button
          onClick={() => handleScroll('up')}
          disabled={!hasPreviousMessage || isEditingAnyField}
          className={`p-3 rounded-full ${
            hasPreviousMessage && !isEditingAnyField
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          } transition-colors`}
        >
          <ChevronUp size={24} />
        </button>
        <button
          onClick={() => handleScroll('down')}
          disabled={!hasNextMessage || isEditingAnyField}
          className={`p-3 rounded-full ${
            hasNextMessage && !isEditingAnyField
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          } transition-colors`}
        >
          <ChevronDown size={24} />
        </button>
      </div>

      <div className="fixed bottom-20 left-8 bg-white rounded-lg shadow px-4 py-2">
        <span className="text-gray-600">
          Viesti {messages.length > 0 ? currentIndex + 1 : 0} / {messages.length}
        </span>
      </div>
    </div>
  );
};

export default MessageList;
