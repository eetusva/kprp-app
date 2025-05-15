import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AuthContextType, UserRole, AppUser, Profile } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Session, User as SupabaseAuthUser, Subscription } from '@supabase/supabase-js'; // Added Subscription

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);


  const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      return data as Profile;
    } catch (error) {
      console.error('Exception fetching user profile:', error);
      return null;
    }
  };
  
  useEffect(() => {
    setIsLoading(true);
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          setUser({ ...session.user, profile });
          setUserRole(profile.role);
          setIsAuthenticated(true);
        } else {
          setUser(session.user as AppUser);
          setUserRole(null);
          setIsAuthenticated(true);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange( // Changed authListener to subscription
      async (_event, session: Session | null) => {
        setIsLoading(true);
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            setUser({ ...session.user, profile });
            setUserRole(profile.role);
            setIsAuthenticated(true);
          } else {
            setUser(session.user as AppUser);
            setUserRole(null);
            setIsAuthenticated(true); 
          }
        } else {
          setUser(null);
          setUserRole(null);
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe(); // Corrected to use subscription.unsubscribe()
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        if (profile) {
          setUser({ ...data.user, profile });
          setUserRole(profile.role);
          setIsAuthenticated(true);
          setIsLoading(false);
          return true;
        } else {
          console.error('Profile not found for user:', data.user.id);
          setUser(data.user as AppUser);
          setUserRole(null);
          setIsAuthenticated(true);
          setIsLoading(false);
          return true; 
        }
      }
      setIsLoading(false);
      return false;
    } catch (e) {
      console.error('Login exception:', e);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    }
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, user, userRole, login, logout, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
