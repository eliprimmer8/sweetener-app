import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import * as api from '../services/api';
import { User, Post } from '../utils/users';
import { DefaultAvatarIcon, BackIcon } from './Icons';

interface UserProfilePageProps {
  user: User;
  onBack: () => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ user, onBack }) => {
  const { currentUser, followUser, unfollowUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const isFollowing = currentUser?.following?.includes(user.id) ?? false;
  const isCurrentUser = currentUser?.id === user.id;

  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const userPosts = await api.apiGetPostsForUser(user.id);
        setPosts(userPosts);
      } catch (err) {
        console.error("Failed to fetch posts", err);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, [user.id]);

  const handleFollowToggle = async () => {
    setIsLoading(true);
    try {
        if (isFollowing) {
          await unfollowUser(user.id);
        } else {
          await followUser(user.id);
        }
    } catch (error) {
        console.error("Failed to toggle follow state", error);
    } finally {
        setIsLoading(false);
    }
  };

  const renderProfileImage = () => {
    if (user.profilePhoto) {
      return <img
        src={user.profilePhoto}
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
        <div className="w-full max-w-md p-8 pt-4 space-y-6 bg-white rounded-2xl shadow-2xl dark:bg-gray-800/90 backdrop-blur-sm m-4 relative mx-auto">
            <div className="absolute top-4 left-4">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Go back"
                >
                    <BackIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </button>
            </div>
            
            <div className="text-center pt-10">
            <div className="relative w-32 h-32 mx-auto mb-4">
                {renderProfileImage()}
            </div>
            
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{user.fullName}</h2>
                <p className="text-md text-indigo-500 dark:text-indigo-400">@{user.username}</p>
                <div className="mt-4 flex justify-center space-x-6 text-gray-600 dark:text-gray-300">
                <div>
                    <span className="font-bold text-gray-900 dark:text-white">{user.following?.length || 0}</span> Following
                </div>
                <div>
                    <span className="font-bold text-gray-900 dark:text-white">{user.followers?.length || 0}</span> Followers
                </div>
                </div>
            </div>
            </div>
            
            {!isCurrentUser && (
                <div className="flex flex-col space-y-3 pt-4">
                    <button
                        onClick={handleFollowToggle}
                        disabled={isLoading}
                        className={`group relative w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200 disabled:opacity-75 ${
                            isFollowing
                            ? 'bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 focus:ring-gray-500'
                            : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900`}
                    >
                        {isLoading ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}
                    </button>
                </div>
            )}
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
            {renderPostGrid()}
        </div>
    </div>
  );
};

export default UserProfilePage;
