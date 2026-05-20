import { useEffect, useState } from 'react';
import { getAllAchievements, getUnlockedIds } from '../services/achievementService';

interface AchievementsListProps {
  onClose: () => void;
  highlightIds?: string[];
}

export function AchievementsList({ onClose, highlightIds = [] }: AchievementsListProps) {
  const [unlocked, setUnlocked] = useState<string[]>([]);

  useEffect(() => {
    setUnlocked(getUnlockedIds());
  }, []);

  const all = getAllAchievements();

  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, rgba(10,10,40,0.9) 0%, rgba(5,5,20,0.95) 100%)',
      zIndex: 20, fontFamily: "'Courier New', monospace", color: '#fff',
    }}>
      <h1 style={{
        fontSize: 32, fontWeight: 'bold', letterSpacing: 6, margin: 0, marginBottom: 20,
        textShadow: '0 0 20px rgba(255,200,0,0.4)',
      }}>
        ACHIEVEMENTS
      </h1>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '50vh', overflowY: 'auto',
        width: 320, padding: '0 10px',
      }}>
        {all.map((a) => {
          const isUnlocked = unlocked.includes(a.id);
          const isNew = highlightIds.includes(a.id);
          return (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px',
              background: isNew ? 'rgba(255,200,50,0.15)' : isUnlocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
              border: isNew ? '1px solid rgba(255,200,50,0.4)' : isUnlocked ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.05)',
              borderRadius: 4, opacity: isUnlocked ? 1 : 0.35,
            }}>
              <div style={{ fontSize: 20 }}>{isUnlocked ? a.icon : '🔒'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 'bold' }}>{a.title}</div>
                <div style={{ fontSize: 10, opacity: 0.5 }}>{a.description}</div>
              </div>
              {isNew && <div style={{ fontSize: 10, color: '#ffdd44' }}>NEW!</div>}
            </div>
          );
        })}
      </div>

      <button onClick={onClose} style={{
        marginTop: 20, padding: '10px 36px', fontSize: 14,
        fontFamily: "'Courier New', monospace", fontWeight: 'bold', letterSpacing: 3,
        color: '#aaccff', background: 'transparent',
        border: '1px solid rgba(100,180,255,0.3)', borderRadius: 4, cursor: 'pointer',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,100,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(100,180,255,0.6)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(100,180,255,0.3)'; e.currentTarget.style.color = '#aaccff'; }}
      >
        BACK
      </button>
    </div>
  );
}
