import { useEffect, useState } from 'react';
import { submitScore } from '../services/leaderboardService';
import { addCoins } from '../services/coinService';
import { checkNewAchievements } from '../services/achievementService';
import { Settings } from '../services/settingsService';
import type { RunStats } from '../game/types';

interface GameOverScreenProps {
  score: number;
  level: number;
  runCoins: number;
  runStats: RunStats;
  onRestart: () => void;
}

export function GameOverScreen({ score, level, runCoins, runStats, onRestart }: GameOverScreenProps) {
  const [playerName, setPlayerName] = useState(() => Settings.playerName);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [lowerScoreMsg, setLowerScoreMsg] = useState('');
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  useEffect(() => {
    const newIds = checkNewAchievements(
      runStats,
      score,
      level,
      runCoins,
      new Set(runStats.powerupTypes),
      false,
    );
    if (newIds.length > 0) {
      setNewAchievements(newIds);
    }
  }, []);

  async function handleSubmit() {
    const name = playerName.trim();
    if (!name) return;

    setSubmitting(true);
    setSubmitError(false);
    setLowerScoreMsg('');

    const result = await submitScore(name, score, level);

    if (result.submitted) {
      Settings.playerName = name;
      if (runCoins > 0) {
        await addCoins(name, runCoins);
      }
      setSubmitted(true);
    } else if (result.reason === 'lower_score') {
      if (runCoins > 0) {
        await addCoins(name, runCoins);
      }
      setLowerScoreMsg(`Your best is ${result.bestScore.toLocaleString()} — keep trying!`);
    } else {
      setSubmitError(true);
    }

    setSubmitting(false);
  }

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
        marginBottom: 4,
      }}>
        {String(score).padStart(6, '0')}
      </div>
      <div style={{
        fontSize: 14,
        opacity: 0.4,
        letterSpacing: 1,
        marginBottom: 30,
      }}>
        LEVEL {level}
      </div>

      <div style={{
        fontSize: 16,
        color: '#ffdd44',
        letterSpacing: 1,
        marginBottom: 8,
        opacity: 0.8,
      }}>
        🪙 {runCoins} coins collected
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4px 20px',
        fontSize: 11,
        opacity: 0.5,
        marginBottom: 20,
        textAlign: 'center',
      }}>
        <div>Kills: {runStats.enemiesKilled}</div>
        <div>Bosses: {runStats.bossKills}</div>
        <div>Max Combo: x{runStats.maxCombo}</div>
        <div>PowerUps: {runStats.powerupsCollected}</div>
        <div>Time: {Math.floor(runStats.timeSurvived)}s</div>
        <div>Level: {level}</div>
      </div>

      {newAchievements.length > 0 && (
        <div style={{
          fontSize: 12, color: '#ffdd44', marginBottom: 12,
          textShadow: '0 0 10px rgba(255,200,0,0.3)',
          letterSpacing: 1,
        }}>
          {newAchievements.map((id) => (
            <div key={id}>🏅 Achievement Unlocked!</div>
          ))}
        </div>
      )}

      {!submitted && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          marginBottom: 30,
        }}>
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
            placeholder="ENTER YOUR NAME"
            maxLength={20}
            style={{
              padding: '10px 16px',
              fontSize: 16,
              fontFamily: "'Courier New', monospace",
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 4,
              color: '#fff',
              textAlign: 'center',
              letterSpacing: 2,
              outline: 'none',
              width: 220,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(100,180,255,0.6)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!playerName.trim() || submitting}
            style={{
              padding: '10px 36px',
              fontSize: 14,
              fontFamily: "'Courier New', monospace",
              fontWeight: 'bold',
              letterSpacing: 2,
              color: '#fff',
              background: !playerName.trim()
                ? 'rgba(100,100,100,0.2)'
                : 'linear-gradient(135deg, #008844, #006633)',
              border: !playerName.trim()
                ? '1px solid rgba(100,100,100,0.3)'
                : '2px solid rgba(0,200,100,0.5)',
              borderRadius: 4,
              cursor: !playerName.trim() ? 'not-allowed' : 'pointer',
              boxShadow: !playerName.trim()
                ? 'none'
                : '0 0 20px rgba(0,200,100,0.2)',
              transition: 'all 0.2s',
              opacity: submitting ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!playerName.trim()) return;
              e.currentTarget.style.background = 'linear-gradient(135deg, #00aa55, #008844)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0,200,100,0.4)';
            }}
            onMouseLeave={(e) => {
              if (!playerName.trim()) return;
              e.currentTarget.style.background = 'linear-gradient(135deg, #008844, #006633)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0,200,100,0.2)';
            }}
          >
            {submitting ? 'SUBMITTING...' : 'SUBMIT SCORE'}
          </button>
          {submitError && (
            <div style={{
              fontSize: 13,
              color: '#ff6666',
              background: 'rgba(255,50,50,0.1)',
              border: '1px solid rgba(255,50,50,0.3)',
              borderRadius: 4,
              padding: '8px 16px',
              opacity: 1,
            }}>
              Failed to submit — check leaderboard table RLS policies
            </div>
          )}
          {lowerScoreMsg && (
            <div style={{ fontSize: 11, color: '#ffcc44', opacity: 0.8 }}>
              {lowerScoreMsg}
            </div>
          )}
        </div>
      )}

      {submitted && (
        <div style={{
          fontSize: 14,
          color: '#66ff99',
          letterSpacing: 1,
          marginBottom: 30,
          opacity: 0.8,
        }}>
          Score submitted!
        </div>
      )}

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
