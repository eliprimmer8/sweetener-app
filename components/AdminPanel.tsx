import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import { User } from '../utils/users';
import { isUsernameReserved } from '../utils/usernames';

interface AdminPanelProps {
    targetUser: User;
    onUserUpdate: (updatedUser: User) => void;
    onUserDelete: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ targetUser, onUserUpdate, onUserDelete }) => {
    const { adminUpdateUser, adminDeleteUser, loading, checkUsernameAvailable } = useContext(UserContext);
    const [newUsername, setNewUsername] = useState(targetUser.username);
    const [usernameStatus, setUsernameStatus] = useState<{ message: string; color: string } | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        setNewUsername(targetUser.username);
    }, [targetUser]);
    
    useEffect(() => {
        if (!newUsername || newUsername === targetUser.username) {
            setUsernameStatus(null);
            return;
        }

        const handler = setTimeout(async () => {
            if (newUsername.length < 3 || newUsername.length > 20) {
                setUsernameStatus({ message: 'Username must be 3-20 characters.', color: 'text-red-500' });
                return;
            }
             if (newUsername.startsWith('_') || newUsername.endsWith('_') || newUsername.includes('__')) {
                setUsernameStatus({ message: 'Invalid underscore usage.', color: 'text-red-500' });
                return;
            }
            if (isUsernameReserved(newUsername)) {
                setUsernameStatus({ message: 'This username is reserved.', color: 'text-red-500' });
                return;
            }
            const isAvailable = await checkUsernameAvailable(newUsername);
            if (isAvailable) {
                setUsernameStatus({ message: 'Username is available!', color: 'text-green-500' });
            } else {
                setUsernameStatus({ message: 'Username is not available.', color: 'text-red-500' });
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [newUsername, targetUser.username, checkUsernameAvailable]);

    const handleVerificationToggle = async () => {
        setError('');
        try {
            const updatedUser = await adminUpdateUser(targetUser.id, { isVerified: !targetUser.isVerified });
            onUserUpdate(updatedUser);
        } catch (err: any) {
            setError(err.message || 'Failed to update verification status.');
        }
    };

    const handleUsernameChange = async () => {
        setError('');
        if (usernameStatus?.color === 'text-red-500' || newUsername === targetUser.username) {
            return;
        }
        try {
            const updatedUser = await adminUpdateUser(targetUser.id, { username: newUsername });
            onUserUpdate(updatedUser);
            setUsernameStatus(null);
        } catch (err: any) {
            setError(err.message || 'Failed to change username.');
        }
    };
    
    const handleDeleteUser = async () => {
        setError('');
        if (window.confirm(`Are you sure you want to delete ${targetUser.username}? This action is irreversible.`)) {
            try {
                await adminDeleteUser(targetUser.id);
                onUserDelete();
            } catch (err: any) {
                setError(err.message || 'Failed to delete user.');
            }
        }
    };

    return (
        <div className="mt-6 border-t border-red-300 dark:border-red-700 pt-4">
            <h3 className="text-lg font-bold text-center text-red-600 dark:text-red-400 mb-4">Admin Panel</h3>
            <div className="space-y-4">
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                
                {/* Verification */}
                <button
                    onClick={handleVerificationToggle}
                    disabled={loading}
                    className="w-full text-sm font-medium rounded-md py-2 px-4 transition-colors disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600"
                >
                    {loading ? '...' : (targetUser.isVerified ? 'Un-verify User' : 'Verify User')}
                </button>

                {/* Username Change */}
                <div className="space-y-1">
                     <label htmlFor="admin-username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Change Username</label>
                    <div className="flex space-x-2">
                        <input
                            id="admin-username"
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            className="flex-grow appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                        <button 
                            onClick={handleUsernameChange}
                            disabled={loading || usernameStatus?.color === 'text-red-500' || newUsername === targetUser.username}
                            className="px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300"
                        >
                            Save
                        </button>
                    </div>
                    {usernameStatus && <p className={`text-xs mt-1 ${usernameStatus.color}`}>{usernameStatus.message}</p>}
                </div>

                {/* Delete User */}
                 <button
                    onClick={handleDeleteUser}
                    disabled={loading}
                    className="w-full text-sm font-medium rounded-md py-2 px-4 transition-colors disabled:opacity-50 bg-red-600 text-white hover:bg-red-700"
                >
                    {loading ? '...' : 'Delete User'}
                </button>
            </div>
        </div>
    );
};

export default AdminPanel;
