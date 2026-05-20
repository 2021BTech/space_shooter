const PREFIX = 'space-shooter';

type SettingValue = string | boolean | number | string[];

const KEYS = {
  PLAYER_NAME: `${PREFIX}-player-name`,
  MUTED: `${PREFIX}-muted`,
  ACHIEVEMENTS: `${PREFIX}-achievements`,
  LIFETIME_KILLS: `${PREFIX}-lifetime-kills`,
  COINS: `${PREFIX}-coins`,
} as const;

const DEFAULTS: Record<string, SettingValue> = {
  [KEYS.PLAYER_NAME]: '',
  [KEYS.MUTED]: false,
  [KEYS.ACHIEVEMENTS]: [],
  [KEYS.LIFETIME_KILLS]: 0,
  [KEYS.COINS]: 0,
};

function getString(key: string): string {
  try {
    return localStorage.getItem(key) ?? (DEFAULTS[key] as string);
  } catch {
    return DEFAULTS[key] as string;
  }
}

function getBool(key: string): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return DEFAULTS[key] as boolean;
    return raw === 'true';
  } catch {
    return DEFAULTS[key] as boolean;
  }
}

function getNumber(key: string): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return DEFAULTS[key] as number;
    const n = parseInt(raw, 10);
    return isNaN(n) ? (DEFAULTS[key] as number) : n;
  } catch {
    return DEFAULTS[key] as number;
  }
}

function getJSON<T>(key: string): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return DEFAULTS[key] as T;
    return JSON.parse(raw) as T;
  } catch {
    return DEFAULTS[key] as T;
  }
}

function setString(key: string, value: string): void {
  localStorage.setItem(key, value);
}

function setBool(key: string, value: boolean): void {
  localStorage.setItem(key, String(value));
}

function setNumber(key: string, value: number): void {
  localStorage.setItem(key, String(value));
}

function setJSON(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const Settings = {
  get playerName(): string { return getString(KEYS.PLAYER_NAME); },
  set playerName(v: string) { setString(KEYS.PLAYER_NAME, v); },

  get muted(): boolean { return getBool(KEYS.MUTED); },
  set muted(v: boolean) { setBool(KEYS.MUTED, v); },

  get achievements(): string[] { return getJSON<string[]>(KEYS.ACHIEVEMENTS); },
  set achievements(v: string[]) { setJSON(KEYS.ACHIEVEMENTS, v); },

  get lifetimeKills(): number { return getNumber(KEYS.LIFETIME_KILLS); },
  set lifetimeKills(v: number) { setNumber(KEYS.LIFETIME_KILLS, v); },

  get coins(): number { return getNumber(KEYS.COINS); },
  set coins(v: number) { setNumber(KEYS.COINS, v); },
};
