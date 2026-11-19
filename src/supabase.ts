import { createClient } from '@supabase/supabase-js';

try {
  if (typeof window !== 'undefined') {
    require('expo-sqlite/localStorage/install');
  }
} catch (error) {
  // Silently fail if the native module is not available
  // This can happen on web or if the native module isn't built yet
  if (error instanceof Error && error.message.includes('ExpoSQLite')) {
    console.debug('ExpoSQLite native module not available, localStorage support will be limited');
  }
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let supabase: ReturnType<typeof createClient> | null = null;

try {
  if (!supabaseUrl || !supabasePublishableKey) {
    console.error(
      'Missing Supabase environment variables. Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to your .env file.'
    );
  } else {
    supabase = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        storage: typeof window !== 'undefined' ? localStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
} catch (error) {
  console.error('Failed to initialize Supabase:', error);
}

export { supabase };

export function createAuthenticatedSupabaseClient(getToken: () => Promise<string | null>) {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      'Missing Supabase environment variables. Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to your .env file.'
    );
  }
  return createClient(supabaseUrl, supabasePublishableKey, {
    accessToken: getToken,
  });
}
