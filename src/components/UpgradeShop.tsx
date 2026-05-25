import { useEffect, useState } from 'react';
import { Settings } from '../services/settingsService';

export interface RunUpgrades {
  extraLife: number;
  shield: boolean;
  spread: boolean;
  speed: boolean;
  coinMagnet: boolean;
}

interface UpgradeItem {
  key: keyof RunUpgrades;
  label: string;
  cost: number;
  maxStack?: number;
  description: string;
}

const PERMANENT_UPGRADES = [
  { key: 'autoFire', label: 'Auto-Fire', cost: 500, description: 'Always fire automatically' },
] as const;

const UPGRADES: UpgradeItem[] = [
  { key: 'extraLife', label: 'Extra Life', cost: 100, maxStack: 2, description: '+1 life' },
  { key: 'shield', label: 'Shield Start', cost: 75, description: 'Start with shield' },
  { key: 'spread', label: 'Spread Start', cost: 50, description: 'Start with spread shot' },
  { key: 'speed', label: 'Speed Boost', cost: 60, description: 'Faster movement' },
  { key: 'coinMagnet', label: 'Coin Magnet', cost: 40, description: 'Wider coin pickup' },
];

interface UpgradeShopProps {
  onStart: (upgrades: RunUpgrades) => void;
  onBack?: () => void;
}

export function UpgradeShop({ onStart, onBack }: UpgradeShopProps) {
  const [balance, setBalance] = useState(Settings.coins);
  const [upgrades, setUpgrades] = useState<RunUpgrades>({
    extraLife: 0, shield: false, spread: false, speed: false, coinMagnet: false,
  });

  useEffect(() => {
    setBalance(Settings.coins);
  }, []);

  const totalCost = UPGRADES.reduce((sum, u) => {
    if (u.key === 'extraLife') return sum + (upgrades.extraLife as number) * u.cost;
    return sum + (upgrades[u.key] ? u.cost : 0);
  }, 0);

  function toggle(key: keyof RunUpgrades, cost: number, maxStack?: number) {
    setUpgrades((prev) => {
      const val = prev[key];
      if (typeof val === 'number') {
        if (val >= (maxStack || 1)) return prev;
        const newCost = totalCost + cost;
        if (newCost > balance) return prev;
        return { ...prev, [key]: val + 1 };
      }
      if (val) {
        return { ...prev, [key]: false };
      }
      const newCost = totalCost + cost;
      if (newCost > balance) return prev;
      return { ...prev, [key]: true };
    });
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, rgba(10,10,40,0.9) 0%, rgba(5,5,20,0.95) 100%)',
      zIndex: 20, fontFamily: "'Courier New', monospace", color: '#fff',
    }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            position: 'absolute', top: 20, left: 20,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 4,
            color: '#aaccff',
            fontFamily: "'Courier New', monospace",
            fontSize: 20,
            padding: '6px 14px',
            cursor: 'pointer',
            letterSpacing: 1,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(100,180,255,0.15)';
            e.currentTarget.style.borderColor = 'rgba(100,180,255,0.5)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.color = '#aaccff';
          }}
        >
          ← BACK
        </button>
      )}
      <h1 style={{
        fontSize: 36, fontWeight: 'bold', letterSpacing: 6,
        textShadow: '0 0 20px rgba(255,200,0,0.4)', margin: 0, marginBottom: 8,
      }}>
        UPGRADE SHOP
      </h1>

      <div style={{
        fontSize: 16, color: '#ffdd44', marginBottom: 24, letterSpacing: 1,
      }}>
        Balance: 🪙 {balance.toLocaleString()}
      </div>

      <div style={{ fontSize: 13, opacity: 0.5, marginBottom: 6, letterSpacing: 1 }}>
        — PERMANENT UPGRADES —
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20,
        width: 300,
      }}>
        {PERMANENT_UPGRADES.map((u) => {
          const owned = u.key === 'autoFire' ? Settings.autoFirePurchased : false;
          const canBuy = !owned && totalCost + u.cost <= balance;
          return (
            <div key={u.key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px',
              background: owned ? 'rgba(0,220,255,0.1)' : 'rgba(255,255,255,0.03)',
              border: owned ? '1px solid rgba(0,220,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 4, cursor: canBuy ? 'pointer' : 'default',
            }}
              onClick={() => {
                if (!canBuy) return;
                Settings.coins -= u.cost;
                if (u.key === 'autoFire') Settings.autoFirePurchased = true;
                setBalance(Settings.coins);
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 'bold' }}>{u.label}</div>
                <div style={{ fontSize: 11, opacity: 0.5 }}>{u.description}</div>
              </div>
              <div style={{
                fontSize: 13, color: owned ? '#00ddff' : '#ffdd44',
                minWidth: 60, textAlign: 'right',
              }}>
                {owned ? '✔' : `🪙${u.cost}`}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 13, opacity: 0.5, marginBottom: 6, letterSpacing: 1 }}>
        — RUN UPGRADES —
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24,
        width: 300,
      }}>
        {UPGRADES.map((u) => {
          const owned = upgrades[u.key];
          const count = typeof owned === 'number' ? owned : (owned ? 1 : 0);
          const atMax = u.maxStack ? count >= u.maxStack : false;
          const canAfford = totalCost + u.cost <= balance;
          const canBuy = (count === 0 || (u.maxStack && count < u.maxStack)) && canAfford;
          return (
            <div key={u.key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px',
              background: count > 0 ? 'rgba(255,200,50,0.1)' : 'rgba(255,255,255,0.03)',
              border: count > 0 ? '1px solid rgba(255,200,50,0.3)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 4, cursor: canBuy ? 'pointer' : 'default',
              opacity: atMax ? 0.5 : 1,
            }}
              onClick={() => canBuy && toggle(u.key, u.cost, u.maxStack)}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 'bold' }}>{u.label}</div>
                <div style={{ fontSize: 11, opacity: 0.5 }}>{u.description}</div>
              </div>
              <div style={{
                fontSize: 13, color: count > 0 ? '#66ff99' : '#ffdd44',
                minWidth: 60, textAlign: 'right',
              }}>
                {count > 0 ? (u.maxStack ? `${count}/${u.maxStack}` : '✔') : `🪙${u.cost}`}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onStart(upgrades)}
        style={{
          padding: '14px 48px', fontSize: 18,
          fontFamily: "'Courier New', monospace", fontWeight: 'bold', letterSpacing: 3,
          color: '#fff',
          background: 'linear-gradient(135deg, #ff8800, #cc6600)',
          border: '2px solid rgba(255,150,0,0.5)', borderRadius: 4,
          cursor: 'pointer',
          boxShadow: '0 0 30px rgba(255,150,0,0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #ffaa22, #ee7700)';
          e.currentTarget.style.boxShadow = '0 0 40px rgba(255,150,0,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #ff8800, #cc6600)';
          e.currentTarget.style.boxShadow = '0 0 30px rgba(255,150,0,0.3)';
        }}
      >
        START RUN
      </button>

      <div style={{ marginTop: 16, fontSize: 11, opacity: 0.3, letterSpacing: 1 }}>
        Unspent coins are saved automatically
      </div>
    </div>
  );
}
