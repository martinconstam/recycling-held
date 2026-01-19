import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  username: string;
  avatar_index: number;
  total_points: number;
  level: number;
  quiz_completed: boolean;
  created_at: string;
}

export interface PlayerStats {
  id: string;
  profile_id: string;
  quiz_score: number;
  process_points: number;
  cards_explored: number;
  updated_at: string;
}

export const getOrCreateProfile = async (
  username: string,
  avatarIndex: number
) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ username, avatar_index: avatarIndex }])
    .select()
    .maybeSingle();

  if (error && error.code !== '23505') {
    throw error;
  }

  if (data) {
    await supabase
      .from('player_stats')
      .insert([{ profile_id: data.id }])
      .select()
      .maybeSingle();

    return data;
  }

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  return existingProfile;
};

export const updatePoints = async (
  profileId: string,
  pointsToAdd: number
) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_points')
    .eq('id', profileId)
    .maybeSingle();

  if (!profile) return null;

  const newTotal = profile.total_points + pointsToAdd;
  const newLevel = Math.floor(newTotal / 100) + 1;

  const { data } = await supabase
    .from('profiles')
    .update({ total_points: newTotal, level: newLevel })
    .eq('id', profileId)
    .select()
    .maybeSingle();

  return data;
};

export const updateQuizScore = async (
  profileId: string,
  correctAnswers: number
) => {
  const points = correctAnswers * 10;

  await updatePoints(profileId, points);

  const { data } = await supabase
    .from('player_stats')
    .update({
      quiz_score: correctAnswers,
      updated_at: new Date().toISOString(),
    })
    .eq('profile_id', profileId)
    .select()
    .maybeSingle();

  return data;
};

export const addProcessPoints = async (profileId: string) => {
  const points = 5;

  await updatePoints(profileId, points);

  const { data: stats } = await supabase
    .from('player_stats')
    .select('cards_explored')
    .eq('profile_id', profileId)
    .maybeSingle();

  const newCardsExplored = (stats?.cards_explored || 0) + 1;

  const { data } = await supabase
    .from('player_stats')
    .update({
      cards_explored: newCardsExplored,
      process_points: newCardsExplored * 5,
      updated_at: new Date().toISOString(),
    })
    .eq('profile_id', profileId)
    .select()
    .maybeSingle();

  return data;
};

export const getLeaderboard = async (limit = 10) => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('total_points', { ascending: false })
    .limit(limit);

  return data || [];
};
