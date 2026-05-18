import { PowerUpType } from '../game/types';

interface HUDProps {
  score: number;
  lives: number;
  powerUp: PowerUpType | null;
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

export function HUD({ score, lives, powerUp }: HUDProps) {
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
      </div>

      <div style={{ textAlign: 'center' }}>
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
