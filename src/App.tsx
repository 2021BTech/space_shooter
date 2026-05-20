import { useCallback, useEffect, useRef, useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { UpgradeShop } from './components/UpgradeShop';
import type { RunUpgrades } from './components/UpgradeShop';
import { TouchControls } from './components/TouchControls';
import { useGame } from './hooks/useGame';
import { GameState, Difficulty } from './game/types';
import './App.css';

function PauseOverlay({ onResume }: { onResume: () => void }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(5,5,15,0.75)',
      zIndex: 25,
      fontFamily: "'Courier New', monospace",
      color: '#fff',
    }}>
      <h2 style={{
        fontSize: 42,
        fontWeight: 'bold',
        letterSpacing: 8,
        textShadow: '0 0 30px rgba(0,150,255,0.5)',
        margin: 0,
        marginBottom: 30,
      }}>
        PAUSED
      </h2>

      <button
        onClick={onResume}
        style={{
          padding: '12px 40px',
          fontSize: 16,
          fontFamily: "'Courier New', monospace",
          fontWeight: 'bold',
          letterSpacing: 2,
          color: '#fff',
          background: 'linear-gradient(135deg, #0066ff, #0044cc)',
          border: '2px solid rgba(0,150,255,0.5)',
          borderRadius: 4,
          cursor: 'pointer',
          boxShadow: '0 0 30px rgba(0,100,255,0.3)',
        }}
      >
        RESUME
      </button>

      <div style={{
        marginTop: 20,
        fontSize: 11,
        opacity: 0.3,
        letterSpacing: 1,
      }}>
        Press ESC or P to resume
      </div>
    </div>
  );
}

function LevelUpBanner({ level }: { level: number }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 30,
      animation: 'fadeOut 1s ease-out forwards',
    }}>
      <div style={{
        fontSize: 42,
        fontWeight: 'bold',
        letterSpacing: 8,
        color: '#ffdd44',
        textShadow: '0 0 40px rgba(255,200,0,0.6), 0 0 80px rgba(255,100,0,0.3)',
        animation: 'levelUpPop 0.5s ease-out',
      }}>
        LEVEL {level}!
      </div>
    </div>
  );
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const prevLevelRef = useRef(1);
  const {
    gameData,
    muted,
    initGame,
    startGame,
    startUpgrade,
    togglePause,
    toggleMute,
    handleRestart,
    setTouch,
    clearTouch,
    setTouchFire,
  } = useGame(canvasRef);

  const handleStart = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    startUpgrade();
  }, [startUpgrade]);

  const handleStartWithUpgrades = useCallback((upgrades: RunUpgrades) => {
    startGame(upgrades, difficulty);
  }, [startGame, difficulty]);

  const handlePlayAgain = useCallback(() => {
    handleRestart();
  }, [handleRestart]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (gameData.state === GameState.START) {
          handleStart('medium');
        } else if (gameData.state === GameState.GAME_OVER) {
          handlePlayAgain();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameData.state, handleStart, handlePlayAgain]);

  useEffect(() => {
    if (gameData.state === GameState.START) {
      prevLevelRef.current = 1;
    }
  }, [gameData.state]);

  useEffect(() => {
    if (gameData.level > prevLevelRef.current && gameData.state === GameState.PLAYING) {
      setLevelUpLevel(gameData.level);
      const t = setTimeout(() => setLevelUpLevel(null), 1000);
      return () => clearTimeout(t);
    }
    prevLevelRef.current = gameData.level;
  }, [gameData.level, gameData.state]);

  const isPlaying = gameData.state === GameState.PLAYING;

  return (
    <div className="app-root">
      <GameCanvas
        canvasRef={canvasRef}
        initGame={initGame}
        gameState={gameData.state}
      />

      {isPlaying && (
        <>
          <HUD
            score={gameData.score}
            lives={gameData.lives}
            level={gameData.level}
            powerUp={gameData.powerUp}
            runCoins={gameData.runCoins}
            muted={muted}
            onPause={togglePause}
            onToggleMute={toggleMute}
          />
          <TouchControls
            onTouch={setTouch}
            onTouchEnd={clearTouch}
            onFire={setTouchFire}
          />
        </>
      )}

      {levelUpLevel && (
        <>
          <LevelUpBanner level={levelUpLevel} />
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 28,
            background: 'rgba(255,255,255,0.08)',
            animation: 'fadeOut 0.4s ease-out forwards',
          }} />
        </>
      )}

      {gameData.state === GameState.START && (
        <StartScreen onStart={handleStart} />
      )}

      {gameData.state === GameState.UPGRADE && (
        <UpgradeShop onStart={handleStartWithUpgrades} onBack={handleRestart} />
      )}

      {gameData.state === GameState.PAUSED && (
        <>
          <HUD
            score={gameData.score}
            lives={gameData.lives}
            level={gameData.level}
            powerUp={gameData.powerUp}
            runCoins={gameData.runCoins}
            muted={muted}
            onPause={togglePause}
            onToggleMute={toggleMute}
          />
          <PauseOverlay onResume={togglePause} />
        </>
      )}

      {gameData.state === GameState.GAME_OVER && (
        <GameOverScreen
          score={gameData.score}
          level={gameData.level}
          runCoins={gameData.runCoins}
          runStats={gameData.runStats}
          onRestart={handlePlayAgain}
        />
      )}
    </div>
  );
}
