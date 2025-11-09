export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  password: string; // In a real app, this would be a hash
  profilePhoto: string; // base64 string or URL
  following: string[];
  followers: string[];
  isAdmin?: boolean;
  isVerified?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  imageUrl: string; // base64
  caption: string;
  createdAt: number; // timestamp
}