import { supabase } from '../lib/supabase';

export async function addCoins(name: string, amount: number): Promise<boolean> {
  try {
    const { data: existing } = await supabase
      .from('leaderboard')
      .select('coins')
      .eq('name', name)
      .maybeSingle();

    if (existing) {
      const newTotal = (existing.coins || 0) + amount;
      const { error } = await supabase
        .from('leaderboard')
        .update({ coins: newTotal })
        .eq('name', name)
        .select();
      if (error) {
        console.error('Error updating coins:', error);
        return false;
      }
      return true;
    }

    const { error } = await supabase
      .from('leaderboard')
      .insert({ name, score: 0, level: 1, coins: amount });
    if (error) {
      console.error('Error inserting coins:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to add coins:', err);
    return false;
  }
}

export async function getCoins(name: string): Promise<number> {
  try {
    const { data } = await supabase
      .from('leaderboard')
      .select('coins')
      .eq('name', name)
      .maybeSingle();
    return data?.coins ?? 0;
  } catch {
    return 0;
  }
}
