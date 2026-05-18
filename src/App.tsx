import { useCallback, useEffect, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { TouchControls } from './components/TouchControls';
import { useGame } from './hooks/useGame';
import { GameState } from './game/types';
import './App.css';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    gameData,
    initGame,
    startGame,
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

  return (
    <div className="app-root">
      <GameCanvas
        canvasRef={canvasRef}
        initGame={initGame}
        gameState={gameData.state}
      />

      {gameData.state === GameState.PLAYING && (
        <>
          <HUD
            score={gameData.score}
            lives={gameData.lives}
            powerUp={gameData.powerUp}
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

      {gameData.state === GameState.GAME_OVER && (
        <GameOverScreen
          score={gameData.score}
          onRestart={handlePlayAgain}
        />
      )}
    </div>
  );
}
