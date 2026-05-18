import { supabase } from '../lib/supabase';

export interface LeaderboardEntry {
  id: number;
  name: string;
  score: number;
  level: number;
  date: string;
  created_at: string;
}

export type SubmitResult =
  | { submitted: true }
  | { submitted: false; reason: 'lower_score'; bestScore: number }
  | { submitted: false; reason: 'error' };

export async function getHighScores(limit = 10): Promise<LeaderboardEntry[]> {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    return [];
  }
}

export async function submitScore(name: string, score: number, level: number): Promise<SubmitResult> {
  try {
    const { data: existing } = await supabase
      .from('leaderboard')
      .select('score')
      .eq('name', name)
      .maybeSingle();

    if (existing) {
      if (score <= existing.score) {
        return { submitted: false, reason: 'lower_score', bestScore: existing.score };
      }

      const { data: updated, error } = await supabase
        .from('leaderboard')
        .update({ score, level })
        .eq('name', name)
        .select();

      if (error || !updated || updated.length === 0) {
        console.error('Error updating score:', error || 'No rows matched for update');
        return { submitted: false, reason: 'error' };
      }

      return { submitted: true };
    }

    const { error } = await supabase
      .from('leaderboard')
      .insert({ name, score, level });

    if (error) {
      console.error('Error inserting score:', error);
      return { submitted: false, reason: 'error' };
    }

    return { submitted: true };
  } catch (err) {
    console.error('Failed to submit score:', err);
    return { submitted: false, reason: 'error' };
  }
}
