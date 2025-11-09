import React, { useState, useEffect } from 'react';
import BottomNav from './BottomNav';
import HomePage from './HomePage';
import SearchPage from './SearchPage';
import NotificationsPage from './NotificationsPage';
import ProfilePage from './ProfilePage';
import UserProfilePage from './UserProfilePage';
import CreatePostPage from './CreatePostPage';
import { User } from '../utils/users';
import * as api from '../services/api';

export type ActiveTab = 'home' | 'search' | 'notifications' | 'profile';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const savedTab = localStorage.getItem('activeTab');
    return (savedTab as ActiveTab) || 'home';
  });
  
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const [isCreatingPost, setIsCreatingPost] = useState<boolean>(() => {
    return localStorage.getItem('isCreatingPost') === 'true';
  });

  const [isRestoringView, setIsRestoringView] = useState(true);

  // Restore viewingUser from localStorage on initial mount
  useEffect(() => {
    const restoreView = async () => {
      const viewingUserId = localStorage.getItem('viewingUserId');
      if (viewingUserId) {
        try {
          const users = await api.apiGetUsersByIds([viewingUserId]);
          if (users.length > 0) {
            setViewingUser(users[0]);
          } else {
            localStorage.removeItem('viewingUserId');
          }
        } catch (error) {
          console.error("Failed to restore viewing user:", error);
          localStorage.removeItem('viewingUserId');
        }
      }
      setIsRestoringView(false);
    };
    restoreView();
  }, []);

  // Persist activeTab to localStorage
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Persist viewingUser to localStorage
  useEffect(() => {
    if (viewingUser) {
      localStorage.setItem('viewingUserId', viewingUser.id);
    } else {
      if (!isRestoringView) {
        localStorage.removeItem('viewingUserId');
      }
    }
  }, [viewingUser, isRestoringView]);
  
  // Persist isCreatingPost to localStorage
  useEffect(() => {
    localStorage.setItem('isCreatingPost', String(isCreatingPost));
  }, [isCreatingPost]);

  const handleViewProfile = (user: User) => {
    setViewingUser(user);
  };

  const handleBack = () => {
    setViewingUser(null);
  }
  
  const handlePostSuccess = () => {
    setIsCreatingPost(false);
    setActiveTab('profile');
  }

  const renderContent = () => {
    if (isRestoringView) {
      return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Loading...</div>;
    }
    
    if (viewingUser) {
        return <UserProfilePage user={viewingUser} onBack={handleBack} />;
    }

    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'search':
        return <SearchPage onViewProfile={handleViewProfile} />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-grow overflow-y-auto pb-16 bg-gray-50 dark:bg-gray-900">
        {renderContent()}
      </main>
      
      {!viewingUser && !isCreatingPost && (
        <BottomNav 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            onOpenCreatePost={() => setIsCreatingPost(true)} 
        />
      )}

      {isCreatingPost && (
        <CreatePostPage 
            onCancel={() => setIsCreatingPost(false)}
            onPostSuccess={handlePostSuccess}
        />
      )}
    </div>
  );
};

export default MainLayout;
