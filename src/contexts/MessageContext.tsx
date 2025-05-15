import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Message, Profile, MessageContextType } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<Profile[]>([]); // Users are now Profiles
  const { isAuthenticated } = useAuth(); // To refetch messages on auth change

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            id,
            username,
            avatar_url,
            role
          )
        `)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }
      setMessages(data as Message[]);
    } catch (e) {
      console.error('Exception fetching messages:', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error('Error fetching users:', error);
        return;
      }
      setUsers(data as Profile[]);
    } catch (e) {
      console.error('Exception fetching users:', e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
      fetchUsers();

      // Set up real-time subscription for new messages
      const messageSubscription = supabase
        .channel('public:messages')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages' },
          (payload) => {
            console.log('Change received!', payload);
            // A simple refetch for now. More sophisticated handling can be added.
            // For example, differentiate between INSERT, UPDATE, DELETE
            fetchMessages(); 
          }
        )
        .subscribe();
      
      // Set up real-time subscription for profile changes
      const profileSubscription = supabase
        .channel('public:profiles')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles' },
          (payload) => {
            console.log('Profile change received!', payload);
            // Update the specific user in the users list and messages
            const updatedProfile = payload.new as Profile;
            setUsers(prevUsers => prevUsers.map(u => u.id === updatedProfile.id ? updatedProfile : u));
            setMessages(prevMessages => prevMessages.map(msg => 
              msg.user_id === updatedProfile.id 
                ? { ...msg, profiles: updatedProfile } 
                : msg
            ));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messageSubscription);
        supabase.removeChannel(profileSubscription);
      };
    } else {
      // Clear messages and users if not authenticated
      setMessages([]);
      setUsers([]);
    }
  }, [isAuthenticated]);

  const addMessage = async (content: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{ content, user_id: userId }]);
      if (error) throw error;
      // Real-time subscription should handle UI update, or call fetchMessages()
    } catch (e) {
      console.error('Error adding message:', e);
    }
  };

  const editMessage = async (id: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ content: newContent, created_at: new Date().toISOString() }) // also update timestamp
        .eq('id', id);
      if (error) throw error;
      // Real-time subscription should handle UI update, or call fetchMessages()
    } catch (e) {
      console.error('Error editing message:', e);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);
      if (error) throw error;
      // Real-time subscription should handle UI update, or call fetchMessages()
    } catch (e) {
      console.error('Error deleting message:', e);
    }
  };

  const editUserUsername = async (userId: string, newUsername: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', userId);
      if (error) throw error;
      // Real-time subscription for profiles should handle UI update
    } catch (e) {
      console.error('Error editing username:', e);
    }
  };

  const editUserAvatar = async (userId: string, newAvatarUrl: string) => {
     try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', userId);
      if (error) throw error;
      // Real-time subscription for profiles should handle UI update
    } catch (e) {
      console.error('Error editing avatar:', e);
    }
  };

  return (
    <MessageContext.Provider value={{ messages, users, addMessage, editMessage, deleteMessage, editUserUsername, editUserAvatar, fetchMessages, fetchUsers }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = (): MessageContextType => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

// This function is no longer needed as users (profiles) are fetched from Supabase
// export const useSampleUsers = (): Profile[] => {
//   const context = useMessages();
//   return context.users;
// };
