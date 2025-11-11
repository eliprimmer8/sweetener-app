export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  profilePhoto: string; // URL
  following: string[];
  followers: string[];
  isAdmin?: boolean;
  isVerified?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  imageUrl: string; // URL
  caption: string;
  createdAt: number; // timestamp
}