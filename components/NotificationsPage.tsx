import React from 'react';

const NotificationsPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Notifications</h1>
      <p className="text-gray-600 dark:text-gray-300">You have no new notifications.</p>
    </div>
  );
};

export default NotificationsPage;
