import { useCallback, useEffect, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { TouchControls } from './components/TouchControls';
import { useGame } from './hooks/useGame';
import { GameState } from './game/types';
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

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    gameData,
    initGame,
    startGame,
    togglePause,
    handleRestart,
    setTouch,
    clearTouch,
    setTouchFire,
  } = useGame(canvasRef);

  const handleStart = useCallback(() => {
    startGame();
  }, [startGame]);

  const handlePlayAgain = useCallback(() => {
    handleRestart();
  }, [handleRestart]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (gameData.state === GameState.START) {
          handleStart();
        } else if (gameData.state === GameState.GAME_OVER) {
          handlePlayAgain();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameData.state, handleStart, handlePlayAgain]);

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
            onPause={togglePause}
          />
          <TouchControls
            onTouch={setTouch}
            onTouchEnd={clearTouch}
            onFire={setTouchFire}
          />
        </>
      )}

      {gameData.state === GameState.START && (
        <StartScreen onStart={handleStart} />
      )}

      {gameData.state === GameState.PAUSED && (
        <>
          <HUD
            score={gameData.score}
            lives={gameData.lives}
            level={gameData.level}
            powerUp={gameData.powerUp}
            onPause={togglePause}
          />
          <PauseOverlay onResume={togglePause} />
        </>
      )}

      {gameData.state === GameState.GAME_OVER && (
        <GameOverScreen
          score={gameData.score}
          onRestart={handlePlayAgain}
        />
      )}
    </div>
  );
}
