import { User, Post } from '../utils/users';
import { createClient } from '@supabase/supabase-js';

// It's safe to use non-null assertions here because we expect these
// to be set in the deployment environment (e.g., Netlify).
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MEDIA_BUCKET = 'public-media';

// --- Auth API ---

export const apiLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
};

export const apiSignup = async (data: { email: string, password: string, username: string, fullName: string, phone?: string }) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
    });
    if (authError) throw authError;
    if (!authData.user) throw new Error("Signup successful, but no user object returned.");
    
    // Insert profile into 'profiles' table
    const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: data.email,
        username: data.username,
        full_name: data.fullName,
        phone: data.phone,
    });

    if (profileError) {
        // Potentially delete the user if profile creation fails to avoid orphaned auth users
        console.error("Failed to create user profile:", profileError);
        throw profileError;
    }
};

export const apiLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const apiRequestPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
};


// --- User & Profile API ---

const mapSupabaseProfileToUser = (profile: any): User => {
    return {
        id: profile.id,
        fullName: profile.full_name,
        username: profile.username,
        email: profile.email,
        phone: profile.phone,
        profilePhoto: profile.profile_photo_url || '',
        following: profile.following || [],
        followers: profile.followers || [],
        isAdmin: profile.is_admin,
        isVerified: profile.is_verified,
    };
};

export const apiGetUserProfile = async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
    return mapSupabaseProfileToUser(data);
};

export const apiUpdateUser = async (userId: string, updates: Partial<User>, photoFile: File | null): Promise<User> => {
    let photoUrl = null;
    if (photoFile) {
        const filePath = `avatars/${userId}/${Date.now()}_${photoFile.name}`;
        const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(filePath, photoFile);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(filePath);
        photoUrl = publicUrl;
    }

    const updateData: { [key: string]: any } = {};
    if (updates.fullName) updateData.full_name = updates.fullName;
    if (updates.username) updateData.username = updates.username;
    if (photoUrl) updateData.profile_photo_url = photoUrl;

    if (Object.keys(updateData).length > 0) {
        const { data, error } = await supabase.from('profiles').update(updateData).eq('id', userId).select().single();
        if (error) throw error;
        return mapSupabaseProfileToUser(data);
    }
    
    const updatedProfile = await apiGetUserProfile(userId);
    if (!updatedProfile) throw new Error("Failed to retrieve updated profile.");
    return updatedProfile;
};

export const apiIsUsernameAvailable = async (username: string): Promise<boolean> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username);
    if (error) throw error;
    return data.length === 0;
};

export const apiSearchUsers = async (query: string, currentUserId: string): Promise<User[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .neq('id', currentUserId) // Exclude current user
        .limit(10);

    if (error) {
        console.error("Error searching users:", error);
        return [];
    }
    return data.map(mapSupabaseProfileToUser);
}


// --- Social Graph API ---

// This is a simplified implementation. A better approach for a large-scale app would be to use a separate 'follows' table.
// For simplicity and to match the existing User model, we'll update the arrays directly.
export const apiFollowUser = async (currentUserId: string, userIdToFollow: string) => {
    // In a real DB, you'd use a transaction here.
    // FIX: Correctly destructure error object and use unique names for error variables.
    const { data: currentUserData, error } = await supabase.from('profiles').select('following').eq('id', currentUserId).single();
    if (error) throw error;
    const newFollowing = [...new Set([...(currentUserData.following || []), userIdToFollow])];
    const { data: updatedCurrentUser, error: updateError } = await supabase.from('profiles').update({ following: newFollowing }).eq('id', currentUserId).select().single();
    if (updateError) throw updateError;

    const { data: targetUserData, error: targetError } = await supabase.from('profiles').select('followers').eq('id', userIdToFollow).single();
    if (targetError) throw targetError;
    const newFollowers = [...new Set([...(targetUserData.followers || []), currentUserId])];
    const { data: updatedTargetUser, error: targetUpdateError } = await supabase.from('profiles').update({ followers: newFollowers }).eq('id', userIdToFollow).select().single();
    if (targetUpdateError) throw targetUpdateError;

    return { updatedCurrentUser: mapSupabaseProfileToUser(updatedCurrentUser), updatedTargetUser: mapSupabaseProfileToUser(updatedTargetUser) };
};

export const apiUnfollowUser = async (currentUserId: string, userIdToUnfollow: string) => {
    // Transaction needed in real app
    // FIX: Correctly destructure error object.
    const { data: currentUserData, error } = await supabase.from('profiles').select('following').eq('id', currentUserId).single();
    if (error) throw error;
    const newFollowing = (currentUserData.following || []).filter((id: string) => id !== userIdToUnfollow);
    const { data: updatedCurrentUser, error: updateError } = await supabase.from('profiles').update({ following: newFollowing }).eq('id', currentUserId).select().single();
    if (updateError) throw updateError;
    
    const { data: targetUserData, error: targetError } = await supabase.from('profiles').select('followers').eq('id', userIdToUnfollow).single();
    if (targetError) throw targetError;
    const newFollowers = (targetUserData.followers || []).filter((id: string) => id !== currentUserId);
    const { data: updatedTargetUser, error: targetUpdateError } = await supabase.from('profiles').update({ followers: newFollowers }).eq('id', userIdToUnfollow).select().single();
    if (targetUpdateError) throw targetUpdateError;
    
    return { updatedCurrentUser: mapSupabaseProfileToUser(updatedCurrentUser), updatedTargetUser: mapSupabaseProfileToUser(updatedTargetUser) };
};

// --- Post API ---

const mapSupabasePost = (post: any): Post => ({
    id: post.id,
    userId: post.user_id,
    imageUrl: post.image_url,
    caption: post.caption,
    createdAt: new Date(post.created_at).getTime(),
});

export const apiCreatePost = async (userId: string, imageFile: File, caption: string): Promise<Post> => {
    const filePath = `posts/${userId}/${Date.now()}_${imageFile.name}`;
    const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(filePath, imageFile);
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(filePath);
    
    const { data, error } = await supabase.from('posts').insert({
        user_id: userId,
        image_url: publicUrl,
        caption: caption
    }).select().single();

    if (error) throw error;
    return mapSupabasePost(data);
};

export const apiGetPostsForUser = async (userId: string): Promise<Post[]> => {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(mapSupabasePost);
};

export const apiGetFeedPosts = async (followingIds: string[]): Promise<Post[]> => {
    if (followingIds.length === 0) return [];
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .in('user_id', followingIds)
        .order('created_at', { ascending: false });
        
    if (error) throw error;
    return data.map(mapSupabasePost);
};

export const apiGetUsersByIds = async (userIds: string[]): Promise<User[]> => {
    if (userIds.length === 0) return [];
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
    if (error) throw error;
    return data.map(mapSupabaseProfileToUser);
};


// --- Admin Functions ---

export const apiAdminUpdateUser = async (targetUserId: string, updates: Partial<User>): Promise<User> => {
    // RLS policies in Supabase should enforce admin privileges
    const updateData: { [key: string]: any } = {};
    if (updates.username) updateData.username = updates.username;
    if (typeof updates.isVerified === 'boolean') updateData.is_verified = updates.isVerified;

    const { data, error } = await supabase.from('profiles').update(updateData).eq('id', targetUserId).select().single();
    if (error) throw error;
    return mapSupabaseProfileToUser(data);
};


export const apiAdminDeleteUser = async (targetUserId: string): Promise<void> => {
    // This should be an RPC function with transaction to delete posts, storage, etc.
    // For client-side, we just delete the user profile. RLS should handle permissions.
    const { error } = await supabase.from('profiles').delete().eq('id', targetUserId);
    if (error) throw error;
    // Note: This doesn't delete the user from auth.users, which requires service_role key.
};