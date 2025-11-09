import { User, Post } from '../utils/users';

const USERS_KEY = 'users';
const POSTS_KEY = 'posts';
const SIMULATED_DELAY = 600; // ms

// --- Internal Helper Functions ---

export const getUsers = (): User[] => {
  try {
    const usersJson = localStorage.getItem(USERS_KEY);
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
  const user = users.find(u => 
      ((u.email && u.email.toLowerCase() === lowerCaseIdentifier) || 
       (u.username && u.username.toLowerCase() === lowerCaseIdentifier) ||
       u.phone === identifier) && 
      u.password === password
  );

  if (user) {
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
    
    users.push(newUser);
    saveUsersToStorage(users);
    return simulateApiCall(newUser);
};


export const apiUpdateUser = (updatedUser: User): Promise<User> => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    
    if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        saveUsersToStorage(users);
        return simulateApiCall(updatedUser);
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
