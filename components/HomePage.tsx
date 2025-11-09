import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import * as api from '../services/api';
import { Post, User } from '../utils/users';
import PostCard from './PostCard';

const HomePage: React.FC = () => {
    const { currentUser } = useContext(UserContext);
    const [feedPosts, setFeedPosts] = useState<Post[]>([]);
    const [authors, setAuthors] = useState<Map<string, User>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            if (!currentUser || !currentUser.following || currentUser.following.length === 0) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const posts = await api.apiGetFeedPosts(currentUser.following);
                setFeedPosts(posts);

                if (posts.length > 0) {
                    const authorIds = [...new Set(posts.map(p => p.userId))];
                    const authorData = await api.apiGetUsersByIds(authorIds);
                    const authorMap = new Map<string, User>();
                    authorData.forEach(author => authorMap.set(author.id, author));
                    setAuthors(authorMap);
                }
            } catch (error) {
                console.error("Failed to fetch feed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, [currentUser]);

    if (loading) {
        return <div className="text-center p-10 text-gray-500 dark:text-gray-400">Loading feed...</div>;
    }

    if (feedPosts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Welcome to Your Feed!</h1>
                <p className="text-gray-600 dark:text-gray-300">Follow users to see their posts here.</p>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto py-4">
            <div className="space-y-4">
                {feedPosts.map(post => {
                    const author = authors.get(post.userId);
                    if (!author) return null;
                    return <PostCard key={post.id} post={post} author={author} />;
                })}
            </div>
        </div>
    );
};

export default HomePage;
