import React, { useContext, useState, useRef, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import * as api from '../services/api';
import { Post } from '../utils/users';
import { isUsernameReserved } from '../utils/usernames';
import { CameraIcon, EditIcon, LogoutIcon, DefaultAvatarIcon } from './Icons';

const ProfilePage: React.FC = () => {
  const { currentUser, logout, updateUser, loading, checkUsernameAvailable } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  
  // State for form fields
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [profilePhoto, setProfilePhoto] = useState(currentUser?.profilePhoto || '');
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<{ message: string; color: string; } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (currentUser) {
        setLoadingPosts(true);
        try {
          const userPosts = await api.apiGetPostsForUser(currentUser.id);
          setPosts(userPosts);
        } catch (err) {
          console.error("Failed to fetch posts", err);
        } finally {
          setLoadingPosts(false);
        }
      }
    };
    fetchPosts();
  }, [currentUser, loading]); // Rerun if currentUser changes or after an update (signalled by `loading` becoming false)

  useEffect(() => {
    if (!isEditing || !currentUser || username === currentUser.username) {
        setUsernameStatus(null);
        return;
    }
    const handler = setTimeout(async () => {
        if (username.length < 3 || username.length > 20) {
            setUsernameStatus({ message: 'Username must be 3-20 characters.', color: 'text-red-500' });
            return;
        }
        if (username.startsWith('_') || username.endsWith('_')) {
            setUsernameStatus({ message: 'Cannot start or end with an underscore.', color: 'text-red-500' });
            return;
        }
        if (username.includes('__')) {
            setUsernameStatus({ message: 'Cannot have consecutive underscores.', color: 'text-red-500' });
            return;
        }
        if (isUsernameReserved(username)) {
            setUsernameStatus({ message: 'This username is reserved.', color: 'text-red-500' });
            return;
        }

        const isAvailable = await checkUsernameAvailable(username);
        if (isAvailable) {
            setUsernameStatus({ message: 'Username is available!', color: 'text-green-500' });
        } else {
            setUsernameStatus({ message: 'Username is not available.', color: 'text-red-500' });
        }
    }, 500);

    return () => clearTimeout(handler);
  }, [username, currentUser, checkUsernameAvailable, isEditing]);


  if (!currentUser) {
    return null; // Or a loading spinner, or redirect
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    setError('');
    const trimmedFullName = fullName.trim();

    if (!trimmedFullName || !username) {
        setError('Full name and username cannot be empty.');
        return;
    }

    if (usernameStatus?.color === 'text-red-500') {
        setError('Please fix the username error before saving.');
        return;
    }
    
    try {
        await updateUser({
            ...currentUser,
            fullName: trimmedFullName,
            username: username,
            profilePhoto,
        });
        setIsEditing(false);
    } catch (err: any) {
        setError(err.message || "Failed to update profile.");
    }
  };
  
  const handleCancel = () => {
    // Reset fields to original state
    setFullName(currentUser.fullName);
    setUsername(currentUser.username);
    setProfilePhoto(currentUser.profilePhoto);
    setError('');
    setUsernameStatus(null);
    setIsEditing(false);
  };

  const renderProfileImage = () => {
    if (profilePhoto) {
        return <img
              src={profilePhoto}
              alt="Profile"
              className="rounded-full w-full h-full object-cover border-4 border-indigo-200 dark:border-indigo-700"
            />
    }
    return (
        <div className="rounded-full w-full h-full bg-gray-200 dark:bg-gray-700 border-4 border-indigo-200 dark:border-indigo-700 flex items-center justify-center">
            <DefaultAvatarIcon className="w-20 h-20 text-gray-400 dark:text-gray-500" />
        </div>
    );
  }

  const renderPostGrid = () => {
    if (loadingPosts) return <p className="text-center text-gray-500 dark:text-gray-400">Loading posts...</p>;
    if (posts.length === 0) return <p className="text-center text-gray-500 dark:text-gray-400">No posts yet.</p>;

    return (
      <div className="grid grid-cols-3 gap-1">
        {posts.map(post => (
          <div key={post.id} className="aspect-square bg-gray-200 dark:bg-gray-700">
            <img src={post.imageUrl} alt={post.caption} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="w-full max-w-md p-8 pt-6 space-y-6 bg-white dark:bg-gray-800/90 backdrop-blur-sm m-4 relative mx-auto">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            {renderProfileImage()}
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                aria-label="Change profile photo"
              >
                <CameraIcon className="w-5 h-5" />
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              className="hidden"
              accept="image/*"
            />
          </div>
          
          {isEditing ? (
            <div className="space-y-4 text-left">
               <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    <input 
                        id="fullName"
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    />
                </div>
                 <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                         <input 
                            id="username"
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            className="appearance-none rounded-md relative block w-full pl-8 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                    </div>
                    {usernameStatus && <p className={`text-xs mt-1 ${usernameStatus.color}`}>{usernameStatus.message}</p>}
                </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{currentUser.fullName}</h2>
              <p className="text-md text-indigo-500 dark:text-indigo-400">@{currentUser.username}</p>
              <div className="mt-4 flex justify-center space-x-6 text-gray-600 dark:text-gray-300">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">{currentUser.following?.length || 0}</span> Following
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">{currentUser.followers?.length || 0}</span> Followers
                </div>
              </div>
            </div>
          )}
        </div>
        
        {error && <p className="text-sm text-red-500 text-center" role="alert">{error}</p>}

        <div className="flex flex-col space-y-3">
          {isEditing ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveChanges}
                disabled={loading || usernameStatus?.color === 'text-red-500'}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 dark:focus:ring-offset-gray-900"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          ) : (
             <button
              onClick={() => setIsEditing(true)}
              className="group relative w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
            >
              <EditIcon className="w-4 h-4 mr-2"/>
              Edit Profile
            </button>
          )}

          <button
            onClick={logout}
            className="group relative w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900"
          >
             <LogoutIcon className="w-4 h-4 mr-2"/>
            Logout
          </button>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
        {renderPostGrid()}
      </div>
    </div>
  );
};

export default ProfilePage;