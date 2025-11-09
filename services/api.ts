import { User, Post } from '../utils/users';

const USERS_KEY = 'users_v2';
const POSTS_KEY = 'posts_v2';
const SIMULATED_DELAY = 600; // ms

// --- Seeding ---
const seedInitialData = () => {
    const initialUsers: User[] = [
        {
            id: '1',
            fullName: 'Ryan Admin',
            username: 'ryan',
            email: 'ryan@sweetener.social',
            password: 'password123',
            profilePhoto: '',
            following: [],
            followers: [],
            isVerified: true
        }
    ];
    saveUsersToStorage(initialUsers);
};


// --- Internal Helper Functions ---

export const getUsers = (): User[] => {
  try {
    const usersJson = localStorage.getItem(USERS_KEY);
    if (!usersJson) {
        seedInitialData();
        return getUsers();
    }
    return usersJson ? JSON.parse(usersJson) : [];
  } catch (error) {
    console.error("Failed to parse users from localStorage", error);
    return [];
  }
};

const saveUsersToStorage = (users: User[]): void => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Failed to save users to localStorage", error);
  }
};

const getPosts = (): Post[] => {
  try {
    const postsJson = localStorage.getItem(POSTS_KEY);
    return postsJson ? JSON.parse(postsJson) : [];
  } catch (error) {
    console.error("Failed to parse posts from localStorage", error);
    return [];
  }
};

const savePostsToStorage = (posts: Post[]): void => {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error("Failed to save posts to localStorage", error);
  }
};


// --- Simulated API Functions ---

const simulateApiCall = <T>(data: T, error?: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (error) {
        reject(new Error(error));
      } else {
        resolve(data);
      }
    }, SIMULATED_DELAY);
  });
};

export const apiLogin = (identifier: string, password: string): Promise<User> => {
  const users = getUsers();
  const lowerCaseIdentifier = identifier.toLowerCase();
  let user = users.find(u => 
      ((u.email && u.email.toLowerCase() === lowerCaseIdentifier) || 
       (u.username && u.username.toLowerCase() === lowerCaseIdentifier) ||
       u.phone === identifier) && 
      u.password === password
  );

  if (user) {
    // Add isAdmin flag at runtime for the admin user
    if (user.username === 'ryan') {
        user = { ...user, isAdmin: true };
    }
    return simulateApiCall(user);
  } else {
    return simulateApiCall(user, 'Invalid credentials.');
  }
};

export const apiSignup = (newUser: User): Promise<User> => {
    const users = getUsers();
    if (users.some(u => u.email && u.email.toLowerCase() === newUser.email.toLowerCase())) {
      return simulateApiCall(newUser, 'An account with this email already exists.');
    }
    if (users.some(u => u.username && u.username.toLowerCase() === newUser.username.toLowerCase())) {
        return simulateApiCall(newUser, 'This username is already taken.');
    }
    if (newUser.phone && users.some(u => u.phone === newUser.phone)) {
      return simulateApiCall(newUser, 'An account with this phone number already exists.');
    }
    
    const userToSave = { ...newUser, isVerified: false };
    users.push(userToSave);
    saveUsersToStorage(users);
    return simulateApiCall(userToSave);
};


export const apiUpdateUser = (updatedUser: User): Promise<User> => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    
    if (userIndex !== -1) {
        // Prevent non-admins from making themselves admin/verified
        const existingUser = users[userIndex];
        users[userIndex] = {
            ...updatedUser,
            isAdmin: existingUser.isAdmin,
            isVerified: existingUser.isVerified,
        };
        saveUsersToStorage(users);
        return simulateApiCall(users[userIndex]);
    }
    return simulateApiCall(updatedUser, "User not found for update.");
};


export const apiIsUsernameAvailable = (username: string): Promise<{ isAvailable: boolean }> => {
    const users = getUsers();
    const isAvailable = !users.some(user => user.username.toLowerCase() === username.toLowerCase());
    return simulateApiCall({ isAvailable });
};


export const apiFollowUser = (currentUserId: string, userIdToFollow: string): Promise<{ updatedCurrentUser: User }> => {
    const users = getUsers();
    const currentUserIndex = users.findIndex(u => u.id === currentUserId);
    const userToFollowIndex = users.findIndex(u => u.id === userIdToFollow);

    if (currentUserIndex > -1 && userToFollowIndex > -1) {
      const currentUserData = users[currentUserIndex];
      const userToFollowData = users[userToFollowIndex];

      const isAlreadyFollowing = (currentUserData.following || []).includes(userIdToFollow);
      
      if (!isAlreadyFollowing) {
        const updatedCurrentUser = { 
          ...currentUserData,
          following: [...(currentUserData.following || []), userIdToFollow]
        };
        const updatedUserToFollow = { 
          ...userToFollowData,
          followers: [...(userToFollowData.followers || []), currentUserId]
        };

        users[currentUserIndex] = updatedCurrentUser;
        users[userToFollowIndex] = updatedUserToFollow;
        
        saveUsersToStorage(users);
        return simulateApiCall({ updatedCurrentUser: users[currentUserIndex] });
      }
    }
    return simulateApiCall({ updatedCurrentUser: users[currentUserIndex] }, "Follow operation failed.");
};


export const apiUnfollowUser = (currentUserId: string, userIdToUnfollow: string): Promise<{ updatedCurrentUser: User }> => {
    const users = getUsers();
    const currentUserIndex = users.findIndex(u => u.id === currentUserId);
    const userToUnfollowIndex = users.findIndex(u => u.id === userIdToUnfollow);

    if (currentUserIndex > -1 && userToUnfollowIndex > -1) {
        const currentUserData = users[currentUserIndex];
        const userToUnfollowData = users[userToUnfollowIndex];

        const updatedCurrentUser = {
          ...currentUserData,
          following: (currentUserData.following || []).filter(id => id !== userIdToUnfollow)
        };
        const updatedUserToUnfollow = {
          ...userToUnfollowData,
          followers: (userToUnfollowData.followers || []).filter(id => id !== currentUserId)
        };
        
        users[currentUserIndex] = updatedCurrentUser;
        users[userToUnfollowIndex] = updatedUserToUnfollow;
        
        saveUsersToStorage(users);
        return simulateApiCall({ updatedCurrentUser: users[currentUserIndex] });
    }
    return simulateApiCall({ updatedCurrentUser: users[currentUserIndex] }, "Unfollow operation failed.");
};

export const apiCreatePost = (post: Omit<Post, 'id' | 'createdAt'>): Promise<Post> => {
    const posts = getPosts();
    const newPost: Post = {
        ...post,
        id: Date.now().toString(),
        createdAt: Date.now()
    };
    posts.unshift(newPost); // Add to the beginning for chronological order
    savePostsToStorage(posts);
    return simulateApiCall(newPost);
};

export const apiGetPostsForUser = (userId: string): Promise<Post[]> => {
    const allPosts = getPosts();
    const userPosts = allPosts.filter(post => post.userId === userId);
    return simulateApiCall(userPosts);
};

export const apiGetFeedPosts = (userIds: string[]): Promise<Post[]> => {
    const allPosts = getPosts();
    const feedPosts = allPosts.filter(post => userIds.includes(post.userId));
    // Already sorted by creation date as we unshift
    return simulateApiCall(feedPosts);
};

export const apiGetUsersByIds = (userIds: string[]): Promise<User[]> => {
    const allUsers = getUsers();
    const userMap = new Map<string, User>();
    allUsers.forEach(user => userMap.set(user.id, user));
    const foundUsers = userIds.map(id => userMap.get(id)).filter((u): u is User => !!u);
    return simulateApiCall(foundUsers);
};


// --- Admin Functions ---

export const apiAdminUpdateUser = (adminId: string, targetUserId: string, updates: Partial<User>): Promise<User> => {
    const users = getUsers();
    const adminUser = users.find(u => u.id === adminId);

    if (!adminUser || adminUser.username !== 'ryan') {
        return simulateApiCall(null, "Unauthorized: Only admins can perform this action.");
    }
    
    const targetUserIndex = users.findIndex(u => u.id === targetUserId);

    if (targetUserIndex !== -1) {
        users[targetUserIndex] = { ...users[targetUserIndex], ...updates };
        saveUsersToStorage(users);
        return simulateApiCall(users[targetUserIndex]);
    }
    return simulateApiCall(null, "Target user not found.");
};


export const apiAdminDeleteUser = (adminId: string, targetUserId: string): Promise<void> => {
    const users = getUsers();
    const adminUser = users.find(u => u.id === adminId);

    if (!adminUser || adminUser.username !== 'ryan') {
        return simulateApiCall(undefined, "Unauthorized: Only admins can perform this action.");
    }

    const updatedUsers = users.filter(u => u.id !== targetUserId);

    if (users.length === updatedUsers.length) {
         return simulateApiCall(undefined, "Target user not found.");
    }

    // Also delete user's posts
    const posts = getPosts();
    const updatedPosts = posts.filter(p => p.userId !== targetUserId);
    savePostsToStorage(updatedPosts);
    
    saveUsersToStorage(updatedUsers);
    return simulateApiCall(undefined);
};