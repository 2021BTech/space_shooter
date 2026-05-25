import { useEffect, useState } from "react";
import { Leaderboard } from "./Leaderboard";
import { Settings } from "../services/settingsService";
import type { Difficulty } from "../game/types";

const STAR_STYLES = [0, 1, 2, 3, 4, 5].map((i) => ({
  width: 2 + Math.random() * 3,
  height: 2 + Math.random() * 3,
  left: `${10 + Math.random() * 80}%`,
  top: `${10 + Math.random() * 60}%`,
  animation: `drift${i} ${4 + Math.random() * 3}s ease-in-out infinite alternate`,
  boxShadow:
    i % 2 === 0
      ? "0 0 6px rgba(100,180,255,0.3)"
      : "0 0 6px rgba(255,100,100,0.3)",
}));

interface StartScreenProps {
  onStart: (difficulty: Difficulty) => void;
}

const DIFFICULTIES: { key: Difficulty; label: string; color: string }[] = [
  { key: 'easy', label: 'EASY', color: '#44dd66' },
  { key: 'medium', label: 'MEDIUM', color: '#ffdd44' },
  { key: 'hard', label: 'HARD', color: '#ff4444' },
];

function TutorialOverlay({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5,5,15,0.92)',
        zIndex: 30,
        fontFamily: "'Courier New', monospace",
        color: '#fff',
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        padding: 40,
        maxWidth: 400,
      }}>
        <h2 style={{
          fontSize: 24,
          fontWeight: 'bold',
          letterSpacing: 4,
          textShadow: '0 0 20px rgba(0,150,255,0.4)',
          margin: 0,
        }}>
          HOW TO PLAY
        </h2>

        <div style={{ fontSize: 11, opacity: 0.4, letterSpacing: 1, textAlign: 'center' }}>
          — KEYBOARD —
        </div>
        <div className="controls-section">
          <div className="controls-group">
            <div className="controls-group-label">Move</div>
            <div className="kbd-row" style={{ justifyContent: 'center' }}>
              <span className="kbd">W</span>
            </div>
            <div className="kbd-row">
              <span className="kbd">A</span>
              <span className="kbd">S</span>
              <span className="kbd">D</span>
            </div>
            <div style={{ fontSize: 10, opacity: 0.3, marginTop: 2 }}>
              or
            </div>
            <div className="kbd-row" style={{ justifyContent: 'center' }}>
              <span className="kbd">↑</span>
            </div>
            <div className="kbd-row">
              <span className="kbd">←</span>
              <span className="kbd">↓</span>
              <span className="kbd">→</span>
            </div>
          </div>
          <div className="controls-group">
            <div className="controls-group-label">Fire</div>
            <span className="kbd kbd-wide" style={{ height: 40, fontSize: 13 }}>SPACE</span>
          </div>
          <div className="controls-group">
            <div className="controls-group-label">Pause</div>
            <div className="kbd-row">
              <span className="kbd">ESC</span>
              <span style={{ fontSize: 10, opacity: 0.3 }}>or</span>
              <span className="kbd">P</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, opacity: 0.4, letterSpacing: 1, textAlign: 'center' }}>
          — MOBILE —
        </div>
        <div className="controls-section">
          <div className="controls-group">
            <div className="controls-group-label">Move</div>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
              }} />
            </div>
            <div style={{ fontSize: 10, opacity: 0.4, marginTop: 2 }}>Drag joystick</div>
          </div>
          <div className="controls-group">
            <div className="controls-group-label">Fire</div>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              border: '2px solid rgba(255,50,50,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'radial-gradient(circle, rgba(255,50,50,0.15), rgba(255,50,50,0.05))',
              color: 'rgba(255,255,255,0.4)', fontSize: 9,
              fontFamily: "'Courier New', monospace", letterSpacing: 1,
            }}>
              FIRE
            </div>
            <div style={{ fontSize: 10, opacity: 0.4, marginTop: 2 }}>Tap & hold</div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            padding: '10px 36px',
            fontSize: 14,
            fontFamily: "'Courier New', monospace",
            fontWeight: 'bold',
            letterSpacing: 2,
            color: '#fff',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 4,
            cursor: 'pointer',
            marginTop: 8,
          }}
        >
          CLOSE
        </button>

        <div style={{ fontSize: 10, opacity: 0.25, letterSpacing: 1 }}>
          Press ESC to close
        </div>
      </div>
    </div>
  );
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [coinBalance, setCoinBalance] = useState<number>(Settings.coins);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCoinBalance(Settings.coins);
  }, []);

  if (showLeaderboard) {
    return <Leaderboard onClose={() => setShowLeaderboard(false)} />;
  }

  if (showTutorial) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(10,10,40,0.8) 0%, rgba(5,5,20,0.95) 100%)",
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: "hidden",
        }}
      >
        <TutorialOverlay onClose={() => setShowTutorial(false)} />
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(ellipse at center, rgba(10,10,40,0.8) 0%, rgba(5,5,20,0.95) 100%)",
        zIndex: 20,
        fontFamily: "'Courier New', monospace",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        {STAR_STYLES.map((style, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...style,
              borderRadius: "50%",
              background:
                i % 2 === 0 ? "rgba(100,180,255,0.4)" : "rgba(255,100,100,0.3)",
            }}
          />
        ))}
      </div>

      <h1
        style={{
          fontSize: 52,
          fontWeight: "bold",
          letterSpacing: 6,
          textShadow: "0 0 20px rgba(0,150,255,0.4)",
          animation: "glowBlue 2s ease-in-out infinite alternate",
          margin: 0,
          marginBottom: 8,
          position: "relative",
        }}
      >
        SPACE
      </h1>
      <h1
        style={{
          fontSize: 52,
          fontWeight: "bold",
          letterSpacing: 6,
          textShadow: "0 0 20px rgba(255,50,50,0.4)",
          animation: "glowRed 2s ease-in-out infinite alternate",
          margin: 0,
          marginBottom: 30,
          marginTop: -10,
          position: "relative",
        }}
      >
        SHOOTER
      </h1>

      <div style={{
        display: "flex",
        gap: 16,
        marginBottom: 28,
        position: "relative",
        alignItems: "center",
      }}>
        {DIFFICULTIES.map((d) => (
          <span
            key={d.key}
            onClick={() => setDifficulty(d.key)}
            style={{
              fontSize: 12,
              fontWeight: "bold",
              letterSpacing: 2,
              color: difficulty === d.key ? d.color : 'rgba(255,255,255,0.3)',
              borderBottom: difficulty === d.key ? `2px solid ${d.color}` : '2px solid transparent',
              paddingBottom: 3,
              cursor: "pointer",
              transition: "all 0.2s",
              userSelect: "none",
            }}
          >
            {d.label}
          </span>
        ))}
      </div>

      <button
        onClick={() => onStart(difficulty)}
        style={{
          padding: "14px 48px",
          fontSize: 18,
          fontFamily: "'Courier New', monospace",
          fontWeight: "bold",
          letterSpacing: 3,
          color: "#fff",
          background: "linear-gradient(135deg, #0066ff, #0044cc)",
          border: "2px solid rgba(0,150,255,0.5)",
          borderRadius: 4,
          cursor: "pointer",
          boxShadow: "0 0 20px rgba(0,100,255,0.2)",
          animation: "btnPulse 2s ease-in-out infinite alternate",
          transition: "all 0.2s",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(135deg, #0088ff, #0066dd)";
          e.currentTarget.style.boxShadow = "0 0 40px rgba(0,100,255,0.5)";
          e.currentTarget.style.borderColor = "rgba(0,150,255,0.8)";
          e.currentTarget.style.animation = "none";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(135deg, #0066ff, #0044cc)";
          e.currentTarget.style.boxShadow = "0 0 20px rgba(0,100,255,0.2)";
          e.currentTarget.style.borderColor = "rgba(0,150,255,0.5)";
          e.currentTarget.style.animation =
            "btnPulse 2s ease-in-out infinite alternate";
        }}
      >
        START GAME
      </button>

      <button
        onClick={() => setShowLeaderboard(true)}
        style={{
          marginTop: 16,
          padding: "10px 36px",
          fontSize: 14,
          fontFamily: "'Courier New', monospace",
          fontWeight: "bold",
          letterSpacing: 3,
          color: "#aaccff",
          background: "transparent",
          border: "1px solid rgba(100,180,255,0.3)",
          borderRadius: 4,
          cursor: "pointer",
          transition: "all 0.2s",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(0,100,255,0.1)";
          e.currentTarget.style.borderColor = "rgba(100,180,255,0.6)";
          e.currentTarget.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "rgba(100,180,255,0.3)";
          e.currentTarget.style.color = "#aaccff";
        }}
      >
        LEADERBOARD
      </button>

      {coinBalance > 0 && (
        <div
          style={{
            marginTop: 16,
            fontSize: 13,
            color: "#ffdd44",
            opacity: 0.7,
            letterSpacing: 1,
            position: "relative",
          }}
        >
          🪙 {coinBalance.toLocaleString()} lifetime coins
        </div>
      )}

      <div
        style={{
          marginTop: 40,
          fontSize: 11,
          opacity: 0.3,
          letterSpacing: 1,
          position: "relative",
        }}
      >
        Press ENTER to start
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 10,
          opacity: 0.25,
          letterSpacing: 1.5,
          position: "relative",
        }}
      >
        powered by beconwave solutions
      </div>

      <button
        onClick={() => setShowTutorial(true)}
        title="How to play"
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.4)',
          fontSize: 16,
          fontWeight: 'bold',
          cursor: 'pointer',
          fontFamily: "'Courier New', monospace",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          lineHeight: 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(100,180,255,0.15)';
          e.currentTarget.style.borderColor = 'rgba(100,180,255,0.4)';
          e.currentTarget.style.color = '#aaccff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
        }}
      >
        ?
      </button>
    </div>
  );
}
