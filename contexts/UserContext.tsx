import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Post } from '../utils/users';
import * as api from '../services/api';
import { supabase } from '../services/api';

interface SignUpData {
    fullName: string;
    username: string;
    email: string;
    phone?: string;
    password: string;
}

interface UserContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (data: SignUpData) => Promise<void>;
  updateUser: (updates: Partial<User>, photoFile: File | null) => Promise<void>;
  requestPasswordReset: (identifier: string) => Promise<void>;
  followUser: (userIdToFollow: string) => Promise<User | void>;
  unfollowUser: (userIdToUnfollow: string) => Promise<User | void>;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
  createPost: (imageFile: File, caption: string) => Promise<void>;
  adminUpdateUser: (targetUserId: string, updates: Partial<User>) => Promise<User>;
  adminDeleteUser: (targetUserId: string) => Promise<void>;
}

export const UserContext = createContext<UserContextType>({
  currentUser: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  signup: async () => {},
  updateUser: async () => {},
  requestPasswordReset: async () => {},
  followUser: async () => {},
  unfollowUser: async () => {},
  checkUsernameAvailable: async () => true,
  createPost: async () => {},
  adminUpdateUser: async () => ({} as User),
  adminDeleteUser: async () => {},
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const profile = await api.apiGetUserProfile(session.user.id);
            setCurrentUser(profile);
        }
        setLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
            const profile = await api.apiGetUserProfile(session.user.id);
            setCurrentUser(profile);
        } else {
            setCurrentUser(null);
        }
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
}, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      await api.apiLogin(email, password);
      // Auth listener will handle setting the user
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await api.apiLogout();
    setCurrentUser(null);
    localStorage.removeItem('activeTab');
    localStorage.removeItem('viewingUserId');
    localStorage.removeItem('isCreatingPost');
  };

  const signup = async (data: SignUpData): Promise<void> => {
    setLoading(true);
    try {
      await api.apiSignup(data);
      // Auth listener will handle setting the user
    } finally {
      setLoading(false);
    }
  };
  
  const updateUser = async (updates: Partial<User>, photoFile: File | null) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
        const updatedUser = await api.apiUpdateUser(currentUser.id, updates, photoFile);
        setCurrentUser(updatedUser);
    } finally {
        setLoading(false);
    }
  };

  const checkUsernameAvailable = async (username: string): Promise<boolean> => {
    const isAvailable = await api.apiIsUsernameAvailable(username);
    return isAvailable;
  };

  const requestPasswordReset = async (email: string) => {
    setLoading(true);
    try {
        await api.apiRequestPasswordReset(email);
    } finally {
        setLoading(false);
    }
  };

  const followUser = async (userIdToFollow: string): Promise<User | void> => {
    if (!currentUser || currentUser.id === userIdToFollow) return;
    try {
      const { updatedCurrentUser, updatedTargetUser } = await api.apiFollowUser(currentUser.id, userIdToFollow);
      setCurrentUser(updatedCurrentUser);
      return updatedTargetUser;
    } catch (error) {
        console.error("Failed to follow user", error);
        throw error;
    }
  };

  const unfollowUser = async (userIdToUnfollow: string): Promise<User | void> => {
    if (!currentUser) return;
    try {
      const { updatedCurrentUser, updatedTargetUser } = await api.apiUnfollowUser(currentUser.id, userIdToUnfollow);
      setCurrentUser(updatedCurrentUser);
      return updatedTargetUser;
    } catch (error) {
        console.error("Failed to unfollow user", error);
        throw error;
    }
  };
  
  const createPost = async (imageFile: File, caption: string) => {
    if (!currentUser) throw new Error("User must be logged in to post.");
    setLoading(true);
    try {
        await api.apiCreatePost(currentUser.id, imageFile, caption);
    } finally {
        setLoading(false);
    }
  }

  const adminUpdateUser = async (targetUserId: string, updates: Partial<User>) => {
      if (!currentUser?.isAdmin) throw new Error("Unauthorized");
      setLoading(true);
      try {
        const updatedUser = await api.apiAdminUpdateUser(targetUserId, updates);
        return updatedUser;
      } finally {
        setLoading(false);
      }
  };
  
  const adminDeleteUser = async (targetUserId: string) => {
    if (!currentUser?.isAdmin) throw new Error("Unauthorized");
    setLoading(true);
    try {
      await api.apiAdminDeleteUser(targetUserId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, loading, login, logout, signup, updateUser, requestPasswordReset, followUser, unfollowUser, checkUsernameAvailable, createPost, adminUpdateUser, adminDeleteUser }}>
      {children}
    </UserContext.Provider>
  );
};