import { useState } from 'react';
import { Leaderboard } from './Leaderboard';

const STAR_STYLES = [0, 1, 2, 3, 4, 5].map((i) => ({
  width: 2 + Math.random() * 3,
  height: 2 + Math.random() * 3,
  left: `${10 + Math.random() * 80}%`,
  top: `${10 + Math.random() * 60}%`,
  animation: `drift${i} ${4 + Math.random() * 3}s ease-in-out infinite alternate`,
  boxShadow: i % 2 === 0
    ? '0 0 6px rgba(100,180,255,0.3)'
    : '0 0 6px rgba(255,100,100,0.3)',
}));

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  if (showLeaderboard) {
    return <Leaderboard onClose={() => setShowLeaderboard(false)} />;
  }

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, rgba(10,10,40,0.8) 0%, rgba(5,5,20,0.95) 100%)',
      zIndex: 20,
      fontFamily: "'Courier New', monospace",
      color: '#fff',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}>
        {STAR_STYLES.map((style, i) => (
          <div key={i} style={{
            position: 'absolute',
            ...style,
            borderRadius: '50%',
            background: i % 2 === 0 ? 'rgba(100,180,255,0.4)' : 'rgba(255,100,100,0.3)',
          }} />
        ))}
      </div>  
      

      <h1 style={{
        fontSize: 52,
        fontWeight: 'bold',
        letterSpacing: 6,
        textShadow: '0 0 20px rgba(0,150,255,0.4)',
        animation: 'glowBlue 2s ease-in-out infinite alternate',
        margin: 0,
        marginBottom: 8,
        position: 'relative',
      }}>
        SPACE
      </h1>
      <h1 style={{
        fontSize: 52,
        fontWeight: 'bold',
        letterSpacing: 6,
        textShadow: '0 0 20px rgba(255,50,50,0.4)',
        animation: 'glowRed 2s ease-in-out infinite alternate',
        margin: 0,
        marginBottom: 30,
        marginTop: -10,
        position: 'relative',
      }}>
        SHOOTER
      </h1>

      <div style={{
        fontSize: 14,
        opacity: 0.5,
        marginBottom: 40,
        letterSpacing: 2,
        textAlign: 'center',
        lineHeight: 1.8,
        position: 'relative',
      }}>
        ARROWS / WASD — Move &nbsp;|&nbsp; SPACE — Fire
      </div>

      <button
        onClick={onStart}
        style={{
          padding: '14px 48px',
          fontSize: 18,
          fontFamily: "'Courier New', monospace",
          fontWeight: 'bold',
          letterSpacing: 3,
          color: '#fff',
          background: 'linear-gradient(135deg, #0066ff, #0044cc)',
          border: '2px solid rgba(0,150,255,0.5)',
          borderRadius: 4,
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(0,100,255,0.2)',
          animation: 'btnPulse 2s ease-in-out infinite alternate',
          transition: 'all 0.2s',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #0088ff, #0066dd)';
          e.currentTarget.style.boxShadow = '0 0 40px rgba(0,100,255,0.5)';
          e.currentTarget.style.borderColor = 'rgba(0,150,255,0.8)';
          e.currentTarget.style.animation = 'none';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #0066ff, #0044cc)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(0,100,255,0.2)';
          e.currentTarget.style.borderColor = 'rgba(0,150,255,0.5)';
          e.currentTarget.style.animation = 'btnPulse 2s ease-in-out infinite alternate';
        }}
      >
        START GAME
      </button>

      <button
        onClick={() => setShowLeaderboard(true)}
        style={{
          marginTop: 16,
          padding: '10px 36px',
          fontSize: 14,
          fontFamily: "'Courier New', monospace",
          fontWeight: 'bold',
          letterSpacing: 3,
          color: '#aaccff',
          background: 'transparent',
          border: '1px solid rgba(100,180,255,0.3)',
          borderRadius: 4,
          cursor: 'pointer',
          transition: 'all 0.2s',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0,100,255,0.1)';
          e.currentTarget.style.borderColor = 'rgba(100,180,255,0.6)';
          e.currentTarget.style.color = '#fff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'rgba(100,180,255,0.3)';
          e.currentTarget.style.color = '#aaccff';
        }}
      >
        LEADERBOARD
      </button>

      <div style={{
        marginTop: 40,
        fontSize: 11,
        opacity: 0.3,
        letterSpacing: 1,
        position: 'relative',
      }}>
        Press ENTER to start
      </div>
    </div>
  );
}
