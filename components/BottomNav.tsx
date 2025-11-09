import React from 'react';
import { ActiveTab } from './MainLayout';
import { HomeIcon, SearchIcon, AddIcon, UserIcon } from './Icons';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCreatePost: () => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = 'text-indigo-600 dark:text-indigo-400';
  const inactiveClasses = 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? activeClasses : inactiveClasses}`}
      aria-label={`Go to ${label}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onOpenCreatePost }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg grid grid-cols-5">
      <NavItem
        label="Home"
        icon={<HomeIcon className="w-6 h-6" />}
        isActive={activeTab === 'home'}
        onClick={() => setActiveTab('home')}
      />
      <NavItem
        label="Search"
        icon={<SearchIcon className="w-6 h-6" />}
        isActive={activeTab === 'search'}
        onClick={() => setActiveTab('search')}
      />
      <div className="flex items-center justify-center">
        <button
            onClick={onOpenCreatePost}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transform transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
            aria-label="Create new post"
        >
            <AddIcon className="w-7 h-7" />
        </button>
      </div>
      {/* Empty placeholder for now. Can add notifications back later */}
      <div />
      <NavItem
        label="Profile"
        icon={<UserIcon className="w-6 h-6" />}
        isActive={activeTab === 'profile'}
        onClick={() => setActiveTab('profile')}
      />
    </nav>
  );
};

export default BottomNav;
