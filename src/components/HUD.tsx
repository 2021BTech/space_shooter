import { PowerUpType } from '../game/types';

interface HUDProps {
  score: number;
  lives: number;
  level: number;
  powerUp: PowerUpType | null;
  onPause: () => void;
}

const powerUpLabels: Record<PowerUpType, string> = {
  spread: 'SPREAD',
  shield: 'SHIELD',
  speed: 'SPEED',
  rapid: 'RAPID',
};

const powerUpColors: Record<PowerUpType, string> = {
  spread: '#00ff88',
  shield: '#4488ff',
  speed: '#ffff44',
  rapid: '#ff4444',
};

export function HUD({ score, lives, level, powerUp, onPause }: HUDProps) {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      padding: '12px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      pointerEvents: 'none',
      fontFamily: "'Courier New', monospace",
      color: '#fff',
      textShadow: '0 0 10px rgba(0,150,255,0.5)',
      zIndex: 10,
    }}>
      <div>
        <div style={{ fontSize: 14, opacity: 0.6 }}>SCORE</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', letterSpacing: 2 }}>
          {String(score).padStart(6, '0')}
        </div>
        <div style={{ fontSize: 12, opacity: 0.4, marginTop: 2 }}>
          LEVEL {level}
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}>
        {powerUp && (
          <div style={{
            fontSize: 14,
            color: powerUpColors[powerUp],
            textShadow: `0 0 15px ${powerUpColors[powerUp]}`,
            animation: 'pulse 1s infinite',
          }}>
            {powerUpLabels[powerUp]}
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPause();
          }}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 4,
            color: '#fff',
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
            padding: '4px 12px',
            cursor: 'pointer',
            pointerEvents: 'auto',
            letterSpacing: 1,
          }}
        >
          II
        </button>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 14, opacity: 0.6 }}>LIVES</div>
        <div style={{ fontSize: 24 }}>
          {Array.from({ length: lives }, (_, i) => (
            <span key={i} style={{ color: '#ff4444', marginLeft: 4 }}>♥</span>
          ))}
        </div>
      </div>
    </div>
  );
}
