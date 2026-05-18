interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
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
    }}>
      <h1 style={{
        fontSize: 52,
        fontWeight: 'bold',
        letterSpacing: 6,
        textShadow: '0 0 30px rgba(0,150,255,0.6), 0 0 60px rgba(0,100,255,0.3)',
        margin: 0,
        marginBottom: 8,
      }}>
        SPACE
      </h1>
      <h1 style={{
        fontSize: 52,
        fontWeight: 'bold',
        letterSpacing: 6,
        textShadow: '0 0 30px rgba(255,50,50,0.6), 0 0 60px rgba(255,0,0,0.3)',
        margin: 0,
        marginBottom: 30,
        marginTop: -10,
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
          boxShadow: '0 0 30px rgba(0,100,255,0.3)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #0088ff, #0066dd)';
          e.currentTarget.style.boxShadow = '0 0 40px rgba(0,100,255,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #0066ff, #0044cc)';
          e.currentTarget.style.boxShadow = '0 0 30px rgba(0,100,255,0.3)';
        }}
      >
        START GAME
      </button>

      <div style={{
        marginTop: 40,
        fontSize: 11,
        opacity: 0.3,
        letterSpacing: 1,
      }}>
        Press ENTER to start
      </div>
    </div>
  );
}
