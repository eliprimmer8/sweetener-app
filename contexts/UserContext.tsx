import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Post } from '../utils/users';
import { isUsernameReserved } from '../utils/usernames';
import * as api from '../services/api';

interface UserContextType {
  currentUser: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (user: User) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  requestPasswordReset: (identifier: string) => Promise<void>;
  followUser: (userIdToFollow: string) => Promise<void>;
  unfollowUser: (userIdToUnfollow: string) => Promise<void>;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
  createPost: (imageUrl: string, caption: string) => Promise<void>;
  adminUpdateUser: (targetUserId: string, updates: Partial<User>) => Promise<User>;
  adminDeleteUser: (targetUserId: string) => Promise<void>;
}

export const UserContext = createContext<UserContextType>({
  currentUser: null,
  loading: false,
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
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const item = window.localStorage.getItem('currentUser');
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.log('Error parsing currentUser from localStorage', error);
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // This effect runs once on initial load to handle retroactive username reservation.
    const userFromStorageJson = localStorage.getItem('currentUser');
    if (userFromStorageJson) {
      const userFromStorage = JSON.parse(userFromStorageJson);
      if (userFromStorage && isUsernameReserved(userFromStorage.username)) {
        // This part of logic is client-side, but it's okay as it's a one-time fixup.
        // For a real backend, this migration would happen server-side.
        const allUsersJSON = localStorage.getItem('users');
        if(allUsersJSON) {
            const allUsers = JSON.parse(allUsersJSON);
            const userIndex = allUsers.findIndex((u:User) => u.id === userFromStorage.id);
            if (userIndex !== -1) {
                const newUsername = `user_${userFromStorage.id}`;
                const updatedUser = { ...userFromStorage, username: newUsername };
                allUsers[userIndex] = updatedUser;
                localStorage.setItem('users', JSON.stringify(allUsers));
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                setCurrentUser(updatedUser);
            }
        }
      }
    }
  }, []);


  useEffect(() => {
    if (currentUser) {
      // Add admin flag at runtime if it's our admin user
      const userToStore = {...currentUser};
      if (userToStore.username === 'ryan') {
          userToStore.isAdmin = true;
      } else {
          delete userToStore.isAdmin;
      }
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const login = async (identifier: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const user = await api.apiLogin(identifier, password);
      setCurrentUser(user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    // Clear layout state on logout
    localStorage.removeItem('activeTab');
    localStorage.removeItem('viewingUserId');
    localStorage.removeItem('isCreatingPost');
  };

  const signup = async (newUser: User): Promise<void> => {
    setLoading(true);
    try {
      const signedUpUser = await api.apiSignup(newUser);
      setCurrentUser(signedUpUser);
    } finally {
      setLoading(false);
    }
  };
  
  const updateUser = async (updatedUser: User) => {
    if (!currentUser || currentUser.id !== updatedUser.id) return;
    
    setLoading(true);
    try {
        const user = await api.apiUpdateUser(updatedUser);
        setCurrentUser(user);
    } finally {
        setLoading(false);
    }
  };

  const checkUsernameAvailable = async (username: string): Promise<boolean> => {
    const { isAvailable } = await api.apiIsUsernameAvailable(username);
    return isAvailable;
  };

  const requestPasswordReset = async (identifier: string) => {
    setLoading(true);
    // In a real app, this would call an API. We'll just simulate it.
    await new Promise(resolve => setTimeout(resolve, 750));
    console.log(`Password reset requested for: ${identifier}.`);
    setLoading(false);
  };

  const followUser = async (userIdToFollow: string) => {
    if (!currentUser || currentUser.id === userIdToFollow) return;
    try {
      const { updatedCurrentUser } = await api.apiFollowUser(currentUser.id, userIdToFollow);
      setCurrentUser(updatedCurrentUser);
    } catch (error) {
        console.error("Failed to follow user", error);
        // Optionally bubble up error to show in UI
    }
  };

  const unfollowUser = async (userIdToUnfollow: string) => {
    if (!currentUser) return;
    try {
      const { updatedCurrentUser } = await api.apiUnfollowUser(currentUser.id, userIdToUnfollow);
      setCurrentUser(updatedCurrentUser);
    } catch (error) {
        console.error("Failed to unfollow user", error);
    }
  };
  
  const createPost = async (imageUrl: string, caption: string) => {
    if (!currentUser) throw new Error("User must be logged in to post.");
    setLoading(true);
    try {
        await api.apiCreatePost({ userId: currentUser.id, imageUrl, caption });
    } finally {
        setLoading(false);
    }
  }

  const adminUpdateUser = async (targetUserId: string, updates: Partial<User>) => {
      if (!currentUser?.isAdmin) throw new Error("Unauthorized");
      setLoading(true);
      try {
        const updatedUser = await api.apiAdminUpdateUser(currentUser.id, targetUserId, updates);
        return updatedUser;
      } finally {
        setLoading(false);
      }
  };
  
  const adminDeleteUser = async (targetUserId: string) => {
    if (!currentUser?.isAdmin) throw new Error("Unauthorized");
    setLoading(true);
    try {
      await api.apiAdminDeleteUser(currentUser.id, targetUserId);
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
