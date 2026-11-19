import { useAuth, useUser } from '@clerk/expo';
import { File } from 'expo-file-system';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren, } from 'react';
import { Platform } from 'react-native';
import type { ForumPost } from '../constants/Forum';
import { createAuthenticatedSupabaseClient } from '../supabase';

export type UserProfile = {
  username: string;
  emailAddress: string;
  about: string;
  avatarUri: string | null;
};

type AppData = {
  profile: UserProfile;
  userId: string | null;
  updateProfile: (profile: UserProfile) => Promise<void>;
  posts: ForumPost[];
  notifications: AppNotification[];
  reports: SightingReport[];
  games: Record<string, GameProgress>;
  dataError: string;
  dataReady: boolean;
  refresh: () => Promise<void>;
  createPost: (title: string, body: string, imageUri: string | null) => Promise<void>;
  createComment: (postId: string, body: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  saveGame: (gameId: string, state: Record<string, unknown>, completed: boolean) => Promise<void>;
  submitReport: (report: Omit<SightingReport, 'id' | 'user_id' | 'status' | 'created_at' | 'photo_url'>, photoUri: string | null) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

export type AppNotification = {
  id: string;
  kind: 'comment' | 'forum' | 'report' | 'achievement';
  title: string;
  message: string;
  created_at: string;
};

export type GameProgress = { state: Record<string, unknown>; completed: boolean };
export type SightingReport = {
  id: string;
  user_id: string;
  species: string;
  description: string;
  sighting_date: string;
  sighting_time: string;
  photo_url: string | null;
  latitude: number;
  longitude: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
};

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children }: PropsWithChildren) {
  const { userId } = useAuth();
  try {
    return <AppDataSession key={userId ?? 'signed-out'}>{children}</AppDataSession>;
  } catch (error) {
    console.error('AppDataProvider error:', error);
    return <>{children}</>;
  }
}

type Achievement = {
  key: 'first_sighting' | 'conversation_starter' | 'game_on' | 'local_spotter' | 'weekly_explorer';
  title: string;
  earned: boolean;
};

function calculateAchievements(reportCount: number, postCount: number, gameCount: number): Achievement[] {
  return [
    { key: 'first_sighting', title: 'First Sighting', earned: reportCount >= 1 },
    { key: 'conversation_starter', title: 'Conversation Starter', earned: postCount >= 1 },
    { key: 'game_on', title: 'Game on', earned: gameCount >= 1 },
    { key: 'local_spotter', title: 'Local Spotter', earned: reportCount >= 10 },
    { key: 'weekly_explorer', title: 'Weekly Explorer', earned: gameCount >= 2 },
  ];
}

function AppDataSession({ children }: PropsWithChildren) {
  const { user } = useUser();
  const { getToken, userId } = useAuth();
  const activeUserId = useRef(userId);
  const refreshVersion = useRef(0);
  const previousAchievementsRef = useRef<Set<string>>(new Set());
  
  const client = useMemo(() => {
    try {
      return createAuthenticatedSupabaseClient(() => getToken());
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      return null;
    }
  }, [getToken]);

  if (!client) {
    console.warn('Supabase client not available, rendering children without data context');
    return <>{children}</>;
  }

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [reports, setReports] = useState<SightingReport[]>([]);
  const [games, setGames] = useState<Record<string, GameProgress>>({});
  const [dataError, setDataError] = useState('');
  const [dataReady, setDataReady] = useState(false);
  const emailAddress = user?.primaryEmailAddress?.emailAddress ?? '';
  const metadataName = user?.unsafeMetadata.displayName;
  const metadataAbout = user?.unsafeMetadata.about;
  const profile = useMemo<UserProfile>(
    () => ({
      username:
        (typeof metadataName === 'string' && metadataName.trim()) ||
        user?.username ||
        user?.fullName ||
        emailAddress.split('@')[0] ||
        'Guest',
      emailAddress,
      about: typeof metadataAbout === 'string' ? metadataAbout : '',
      avatarUri: user?.imageUrl ?? null,
    }),
    [emailAddress, metadataAbout, metadataName, user],
  );

  const updateProfile = useCallback(
    async (nextProfile: UserProfile) => {
      if (!user) {
        throw new Error('You must be signed in to update your profile.');
      }

      const username = nextProfile.username.trim();
      if (!username) {
        throw new Error('A display name is required.');
      }

      if (nextProfile.avatarUri !== user.imageUrl) {
        await user.setProfileImage({ file: nextProfile.avatarUri });
      }

      await user.updateMetadata({
        unsafeMetadata: {
          displayName: username,
          about: nextProfile.about.trim(),
        },
      });
    },
    [user],
  );

  const refresh = useCallback(async () => {
    if (!userId) return;
    const version = ++refreshVersion.current;
    const [postResult, notificationResult, reportResult, gameResult, achievementResult] = await Promise.all([
      client.from('forum_posts').select('*, app_profiles(username), forum_comments(*, app_profiles(username))').order('created_at', { ascending: false }),
      client.from('app_notifications').select('*').order('created_at', { ascending: false }),
      client.from('sighting_reports').select('*').order('created_at', { ascending: false }),
      client.from('game_progress').select('game_id, state, completed'),
      client.from('earned_achievements').select('achievement_key').eq('user_id', userId),
    ]);
    const error = postResult.error || notificationResult.error || reportResult.error || gameResult.error;
    if (error) throw error;
    if (activeUserId.current !== userId) return;
    
    // Log achievement errors for debugging
    if (achievementResult.error) {
      console.warn('Achievement query error (this is OK if migration not applied):', achievementResult.error.message);
    }
    
    // Load existing achievements on first load
    if (previousAchievementsRef.current.size === 0 && !achievementResult.error && achievementResult.data) {
      (achievementResult.data ?? []).forEach((row: { achievement_key: string }) => {
        previousAchievementsRef.current.add(row.achievement_key);
      });
    }
    
    const nextPosts: ForumPost[] = (postResult.data ?? []).map((post) => ({
      id: post.id,
      userId: post.user_id,
      title: post.title,
      body: post.body,
      author: post.app_profiles?.username ?? 'Unknown',
      timestamp: new Date(post.created_at).toLocaleDateString(),
      comments: (post.forum_comments ?? []).map((comment: { id: string; app_profiles: { username: string } | null; body: string; created_at: string }) => ({
        id: comment.id,
        author: comment.app_profiles?.username ?? 'Unknown',
        body: comment.body,
        timestamp: new Date(comment.created_at).toLocaleDateString(),
      })),
      ...(post.image_url ? { type: 'image' as const, imageUri: post.image_url } : { type: 'text' as const }),
    }));
    const reportRows: SightingReport[] = reportResult.data ?? [];
    const reportPhotos = await Promise.all(reportRows.map(async (report) => {
      if (!report.photo_url) return report;
      const { data, error: photoError } = await client.storage.from('report-images').createSignedUrl(report.photo_url, 3600);
      if (photoError) throw photoError;
      return { ...report, photo_url: data.signedUrl };
    }));
    if (activeUserId.current !== userId || version !== refreshVersion.current) return;
  
    const userReportCount = reportPhotos.filter((r) => r.user_id === userId).length;
    const userPostCount = nextPosts.filter((p) => p.userId === userId).length;
    const userGameCount = Object.values(gameResult.data ?? []).filter((g) => g.completed).length;
    console.log('Achievement counts:', { userReportCount, userPostCount, userGameCount, userId });
    
    const achievements = calculateAchievements(userReportCount, userPostCount, userGameCount);
    console.log('Calculated achievements:', achievements);
    console.log('Previously earned:', Array.from(previousAchievementsRef.current));
    
    const newAchievements = achievements.filter((a) => a.earned && !previousAchievementsRef.current.has(a.key));
    console.log('New achievements detected:', newAchievements.map((a) => a.key));
    
    if (newAchievements.length > 0) {
      console.log('Attempting to insert new achievements:', newAchievements.map((a) => a.key));
      const insertData = newAchievements.map((a) => ({ user_id: userId, achievement_key: a.key }));
      console.log('Insert data:', insertData);
      
      const { data, error: achievementError } = await client.from('earned_achievements').insert(insertData);
      if (achievementError) {
        console.error('Achievement insertion error details:', {
          code: achievementError.code,
          message: achievementError.message,
          details: achievementError.details,
          hint: achievementError.hint,
        });
      } else {
        console.log('Achievements inserted successfully:', data);
        newAchievements.forEach((a) => previousAchievementsRef.current.add(a.key));
      }
    }
    
    if (achievementResult.error) {
      console.log('Achievement SELECT error (table may not exist):', achievementResult.error.message);
    }
    
    // Update all earned achievements in tracking set
    achievements.filter((a) => a.earned).forEach((a) => previousAchievementsRef.current.add(a.key));
    
    setPosts(nextPosts);
    setNotifications(notificationResult.data ?? []);
    setReports(reportPhotos);
    setGames(Object.fromEntries((gameResult.data ?? []).map((game) => [game.game_id, { state: game.state, completed: game.completed }])));
    setDataError('');
    setDataReady(true);
  }, [client, userId]);

  const refreshAfterWrite = useCallback(async () => {
    try {
      await refresh();
    } catch (error) {
      if (activeUserId.current === userId) setDataError(error instanceof Error ? error.message : 'Saved, but unable to refresh account data.');
    }
  }, [refresh, userId]);

  useEffect(() => {
    activeUserId.current = userId;
    if (!userId) return () => { activeUserId.current = null; };
    let active = true;
    const load = async () => {
      try {
        const { error } = await client.from('app_profiles').upsert({ user_id: userId, username: profile.username, updated_at: new Date().toISOString() });
        if (error) throw error;
        if (active) await refresh();
      } catch (error) {
        if (active) setDataError(error instanceof Error ? error.message : 'Unable to load account data.');
      }
    };
    void load();
    const timer = setInterval(() => { void load(); }, 30000);
    return () => { active = false; activeUserId.current = null; clearInterval(timer); };
  }, [client, profile.username, refresh, userId]);

  const uploadImage = useCallback(async (uri: string, bucket: 'community-images' | 'report-images') => {
    if (!userId) throw new Error('Sign in to upload an image.');
    let data: ArrayBuffer;
    let contentType: string;
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      if (!response.ok) throw new Error('Unable to read the selected image.');
      data = await response.arrayBuffer();
      contentType = response.headers.get('content-type') || 'image/jpeg';
    } else {
      const file = new File(uri);
      data = await file.arrayBuffer();
      contentType = file.type || 'image/jpeg';
    }
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const { error } = await client.storage.from(bucket).upload(path, data, { contentType });
    if (error) throw error;
    return bucket === 'community-images' ? client.storage.from(bucket).getPublicUrl(path).data.publicUrl : path;
  }, [client, userId]);

  const createPost = useCallback(async (title: string, body: string, imageUri: string | null) => {
    if (!userId) throw new Error('Sign in to create a post.');
    const image_url = imageUri ? await uploadImage(imageUri, 'community-images') : null;
    const { error } = await client.from('forum_posts').insert({ user_id: userId, title, body, image_url });
    if (error) throw error;
    await refreshAfterWrite();
  }, [client, refreshAfterWrite, uploadImage, userId]);

  const createComment = useCallback(async (postId: string, body: string) => {
    if (!userId) throw new Error('Sign in to comment.');
    const { error } = await client.from('forum_comments').insert({ user_id: userId, post_id: postId, body });
    if (error) throw error;
    await refreshAfterWrite();
  }, [client, refreshAfterWrite, userId]);

  const deletePost = useCallback(async (postId: string) => {
    if (!userId) throw new Error('Sign in to delete a post.');
    const { error } = await client.from('forum_posts').delete().eq('id', postId).eq('user_id', userId);
    if (error) throw error;
    await refreshAfterWrite();
  }, [client, refreshAfterWrite, userId]);

  const saveGame = useCallback(async (gameId: string, state: Record<string, unknown>, completed: boolean) => {
    if (!userId) throw new Error('Sign in to save game progress.');
    const wasCompleted = games[gameId]?.completed ?? false;
    const { data, error } = await client.from('game_progress').upsert({ user_id: userId, game_id: gameId, state, completed: completed || wasCompleted, updated_at: new Date().toISOString() }).select('completed').single();
    if (error) throw error;
    if (activeUserId.current !== userId) return;
    refreshVersion.current += 1;
    setGames((current) => ({ ...current, [gameId]: { state, completed: data.completed } }));
  }, [client, games, userId]);

  const submitReport = useCallback(async (report: Omit<SightingReport, 'id' | 'user_id' | 'status' | 'created_at' | 'photo_url'>, photoUri: string | null) => {
    if (!userId) throw new Error('Sign in to submit a report.');
    const photo_url = photoUri ? await uploadImage(photoUri, 'report-images') : null;
    const { error } = await client.from('sighting_reports').insert({ ...report, user_id: userId, photo_url });
    if (error) throw error;
    await refreshAfterWrite();
  }, [client, refreshAfterWrite, uploadImage, userId]);

  const deleteAccount = useCallback(async () => {
    if (!userId) throw new Error('Sign in to delete your account.');
    if (!user) throw new Error('User not found.');
    console.log('Starting account deletion for user:', userId);
    
    // Delete the profile - this cascades to delete all related data
    const { data, error } = await client.from('app_profiles').delete().eq('user_id', userId).select();
    
    if (error) {
      console.error('Account deletion error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }
    
    console.log('App profile deleted successfully:', data);
    
    // Delete the Clerk user account to prevent re-login
    console.log('Deleting Clerk user account...');
    await user.delete();
    console.log('Clerk user account deleted successfully');
  }, [client, user, userId]);

  const value = useMemo(
    () => ({ profile, userId: userId ?? null, updateProfile, posts, notifications, reports, games, dataError, dataReady, refresh, createPost, createComment, deletePost, saveGame, submitReport, deleteAccount }),
    [profile, userId, updateProfile, posts, notifications, reports, games, dataError, dataReady, refresh, createPost, createComment, deletePost, saveGame, submitReport, deleteAccount],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider.');
  }
  return context;
}
