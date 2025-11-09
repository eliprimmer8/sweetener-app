import React, { useState } from 'react';
import BottomNav from './BottomNav';
import HomePage from './HomePage';
import SearchPage from './SearchPage';
import NotificationsPage from './NotificationsPage';
import ProfilePage from './ProfilePage';
import UserProfilePage from './UserProfilePage';
import CreatePostPage from './CreatePostPage';
import { User } from '../utils/users';

export type ActiveTab = 'home' | 'search' | 'notifications' | 'profile';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);


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
