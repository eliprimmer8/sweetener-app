import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
// Fix: Import User from utils/users and getUsers from services/api
import { User } from '../utils/users';
import { getUsers } from '../services/api';
import { DefaultAvatarIcon, SearchIcon, VerifiedIcon } from './Icons';

interface SearchPageProps {
  onViewProfile: (user: User) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ onViewProfile }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const { currentUser, followUser, unfollowUser } = useContext(UserContext);
  const [togglingFollow, setTogglingFollow] = useState<string | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults([]);
      return;
    }

    const allUsers = getUsers();
    const filteredUsers = allUsers.filter(user => {
      const lowerCaseQuery = trimmedQuery.toLowerCase();
      // Exclude current user from search results
      if (user.id === currentUser?.id) {
        return false;
      }
      return (
        user.username.toLowerCase().includes(lowerCaseQuery) ||
        user.fullName.toLowerCase().includes(lowerCaseQuery)
      );
    });

    setResults(filteredUsers);
  }, [query, currentUser?.id, currentUser?.following]);


  const handleFollowToggle = async (userId: string, isFollowing: boolean) => {
    setTogglingFollow(userId);
    try {
        if (isFollowing) {
          await unfollowUser(userId);
        } else {
          await followUser(userId);
        }
    } catch (error) {
        console.error('Failed to toggle follow state', error);
    } finally {
        setTogglingFollow(null);
    }
  };


  const renderUser = (user: User) => {
    const isFollowing = currentUser?.following?.includes(user.id) ?? false;
    const isLoading = togglingFollow === user.id;

    return (
        <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-150">
          <div className="flex items-center flex-grow cursor-pointer" onClick={() => onViewProfile(user)}>
            {user.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.fullName} className="w-12 h-12 rounded-full object-cover mr-4" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-4 flex-shrink-0">
                <DefaultAvatarIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
            )}
            <div className="flex-grow">
              <p className="font-bold text-gray-800 dark:text-white">{user.fullName}</p>
              <div className="flex items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                {user.isVerified && <VerifiedIcon className="w-3 h-3 text-blue-500 ml-1" />}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleFollowToggle(user.id, isFollowing)}
            disabled={isLoading}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ml-4 flex-shrink-0 w-24 text-center disabled:opacity-75 ${
                isFollowing 
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
        >
            {isLoading ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}
        </button>
        </div>
      );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 text-center">Search</h1>
      <div className="relative mb-6">
         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400"/>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for users..."
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        />
      </div>

      <div>
        {query.trim() === '' && (
           <p className="text-center text-gray-500 dark:text-gray-400">Discover new content and users.</p>
        )}
        {query.trim() !== '' && results.length > 0 && (
          <div className="space-y-2">
            {results.map(renderUser)}
          </div>
        )}
        {query.trim() !== '' && results.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">No users found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;