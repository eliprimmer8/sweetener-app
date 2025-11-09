import React, { useState, useContext, useRef } from 'react';
import { UserContext } from '../contexts/UserContext';
import { BackIcon, CameraIcon } from './Icons';

interface CreatePostPageProps {
    onCancel: () => void;
    onPostSuccess: () => void;
}

const CreatePostPage: React.FC<CreatePostPageProps> = ({ onCancel, onPostSuccess }) => {
    const [image, setImage] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [error, setError] = useState('');
    const { createPost, loading } = useContext(UserContext);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.onerror = () => {
                setError("Failed to read the image file.");
            }
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!image) {
            setError('Please select an image to post.');
            return;
        }
        setError('');
        try {
            await createPost(image, caption);
            onPostSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to create post.');
        }
    };

    return (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
            <header className="flex items-center justify-between p-4 border-b dark:border-gray-700 flex-shrink-0">
                <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <BackIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                </button>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">New Post</h1>
                <button 
                    onClick={handleSubmit}
                    disabled={!image || loading}
                    className="font-bold text-indigo-600 dark:text-indigo-400 disabled:text-gray-400 dark:disabled:text-gray-500"
                >
                    {loading ? 'Posting...' : 'Post'}
                </button>
            </header>
            <main className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-4 max-w-lg mx-auto">
                    <div>
                        {image ? (
                            <div className="relative">
                                <img src={image} alt="Preview" className="w-full h-auto rounded-lg" />
                                <button
                                    onClick={() => setImage(null)}
                                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5"
                                    aria-label="Clear image"
                                >
                                    &times;
                                </button>
                            </div>
                        ) : (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-500 transition"
                            >
                                <CameraIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2" />
                                <span className="text-gray-600 dark:text-gray-400">Tap to select a photo</span>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>
                    <div>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Write a caption..."
                            className="w-full p-2 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                            rows={4}
                        />
                    </div>
                     {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                </div>
            </main>
        </div>
    );
};

export default CreatePostPage;
