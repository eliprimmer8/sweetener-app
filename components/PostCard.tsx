import React from 'react';
import { Post, User } from '../utils/users';
import { DefaultAvatarIcon, VerifiedIcon } from './Icons';

interface PostCardProps {
    post: Post;
    author: User;
}

const PostCard: React.FC<PostCardProps> = ({ post, author }) => {

    const timeAgo = (timestamp: number): string => {
        const now = Date.now();
        const seconds = Math.floor((now - timestamp) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo";
        
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        
        return Math.floor(seconds) + "s";
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mx-2 sm:mx-0">
            <div className="p-3 flex items-center space-x-3">
                 {author.profilePhoto ? (
                    <img src={author.profilePhoto} alt={author.fullName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                        <DefaultAvatarIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    </div>
                )}
                <div className="flex items-center">
                    <p className="font-bold text-sm text-gray-800 dark:text-white">{author.username}</p>
                    {author.isVerified && <VerifiedIcon className="w-3 h-3 text-blue-500 ml-1" />}
                </div>
            </div>

            <img src={post.imageUrl} alt="Post content" className="w-full h-auto" />
            
            <div className="p-3">
                 <p className="text-sm text-gray-800 dark:text-gray-200">
                    <span className="font-bold mr-2">{author.username}</span>
                    {post.caption}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{timeAgo(post.createdAt)} ago</p>
            </div>
        </div>
    );
};

export default PostCard;