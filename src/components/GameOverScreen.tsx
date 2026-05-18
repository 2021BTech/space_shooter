interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

export function GameOverScreen({ score, onRestart }: GameOverScreenProps) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, rgba(40,5,5,0.85) 0%, rgba(5,5,20,0.95) 100%)',
      zIndex: 20,
      fontFamily: "'Courier New', monospace",
      color: '#fff',
    }}>
      <h1 style={{
        fontSize: 48,
        fontWeight: 'bold',
        letterSpacing: 6,
        textShadow: '0 0 30px rgba(255,50,50,0.6), 0 0 60px rgba(255,0,0,0.3)',
        margin: 0,
        marginBottom: 20,
      }}>
        GAME OVER
      </h1>

      <div style={{
        fontSize: 16,
        opacity: 0.5,
        letterSpacing: 2,
        marginBottom: 8,
      }}>
        FINAL SCORE
      </div>
      <div style={{
        fontSize: 48,
        fontWeight: 'bold',
        letterSpacing: 4,
        textShadow: '0 0 20px rgba(255,200,50,0.4)',
        marginBottom: 50,
      }}>
        {String(score).padStart(6, '0')}
      </div>

      <button
        onClick={onRestart}
        style={{
          padding: '14px 48px',
          fontSize: 18,
          fontFamily: "'Courier New', monospace",
          fontWeight: 'bold',
          letterSpacing: 3,
          color: '#fff',
          background: 'linear-gradient(135deg, #cc0044, #880033)',
          border: '2px solid rgba(255,50,50,0.5)',
          borderRadius: 4,
          cursor: 'pointer',
          boxShadow: '0 0 30px rgba(255,0,50,0.3)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #ee0055, #aa0044)';
          e.currentTarget.style.boxShadow = '0 0 40px rgba(255,0,50,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #cc0044, #880033)';
          e.currentTarget.style.boxShadow = '0 0 30px rgba(255,0,50,0.3)';
        }}
      >
        PLAY AGAIN
      </button>

      <div style={{
        marginTop: 30,
        fontSize: 11,
        opacity: 0.3,
        letterSpacing: 1,
      }}>
        Press ENTER to restart
      </div>
    </div>
  );
}
