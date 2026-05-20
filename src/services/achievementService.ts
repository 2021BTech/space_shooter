import { Settings } from './settingsService';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_kill', title: 'First Blood', description: 'Kill your first enemy', icon: '⚔' },
  { id: 'kills_100', title: 'Centurion', description: 'Kill 100 enemies', icon: '💀' },
  { id: 'kills_500', title: 'Exterminator', description: 'Kill 500 enemies', icon: '☠' },
  { id: 'first_boss', title: 'Boss Slayer', description: 'Kill your first boss', icon: '👑' },
  { id: 'boss_10', title: 'Legendary Hunter', description: 'Kill 10 bosses', icon: '🏆' },
  { id: 'combo_5', title: 'Combo King', description: 'Reach x5 combo', icon: '🔥' },
  { id: 'score_10000', title: 'High Scorer', description: 'Score 10,000 in a single run', icon: '⭐' },
  { id: 'level_10', title: 'Veteran', description: 'Reach Level 10', icon: '🎖' },
  { id: 'coins_500', title: 'Coin Hoarder', description: 'Collect 500 coins total', icon: '💰' },
  { id: 'immortal', title: 'Immortal', description: 'Beat a boss without dying', icon: '💎' },
  { id: 'all_powerups', title: 'Power Collector', description: 'Collect all 5 powerup types in one run', icon: '✨' },
];

export function getAllAchievements(): Achievement[] {
  return ALL_ACHIEVEMENTS;
}

export function getUnlockedIds(): string[] {
  return Settings.achievements;
}

export function isUnlocked(id: string): boolean {
  return Settings.achievements.includes(id);
}

export function unlock(id: string): boolean {
  const unlocked = Settings.achievements;
  if (unlocked.includes(id)) return false;
  unlocked.push(id);
  Settings.achievements = unlocked;
  return true;
}

export function checkNewAchievements(
  runStats: { enemiesKilled: number; bossKills: number; maxCombo: number; powerupsCollected: number; timeSurvived: number; killsByType: Record<string, number> },
  score: number,
  level: number,
  totalCoins: number,
  powerupTypesCollected: Set<string>,
  died: boolean,
): string[] {
  const newlyUnlocked: string[] = [];
  const totalKills = runStats.enemiesKilled;
  const totalBossKills = runStats.bossKills;

  const lifetimeKills = totalKills + Settings.lifetimeKills;

  if (totalKills >= 1 && unlock('first_kill')) newlyUnlocked.push('first_kill');
  if (lifetimeKills >= 100 && unlock('kills_100')) newlyUnlocked.push('kills_100');
  if (lifetimeKills >= 500 && unlock('kills_500')) newlyUnlocked.push('kills_500');
  if (totalBossKills >= 1 && unlock('first_boss')) newlyUnlocked.push('first_boss');
  if (totalBossKills >= 10 && unlock('boss_10')) newlyUnlocked.push('boss_10');
  if (runStats.maxCombo >= 5 && unlock('combo_5')) newlyUnlocked.push('combo_5');
  if (score >= 10000 && unlock('score_10000')) newlyUnlocked.push('score_10000');
  if (level >= 10 && unlock('level_10')) newlyUnlocked.push('level_10');
  if (totalCoins >= 500 && unlock('coins_500')) newlyUnlocked.push('coins_500');
  if (totalBossKills >= 1 && !died && unlock('immortal')) newlyUnlocked.push('immortal');
  if (powerupTypesCollected.size >= 5 && unlock('all_powerups')) newlyUnlocked.push('all_powerups');

  Settings.lifetimeKills = lifetimeKills;

  return newlyUnlocked;
}
