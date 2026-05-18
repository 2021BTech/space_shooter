import { useRef, useCallback, useEffect, useState } from 'react';
import { Game } from '../game/Game';
import { GameState, PowerUpType } from '../game/types';

export interface GameStateData {
  state: GameState;
  score: number;
  lives: number;
  powerUp: PowerUpType | null;
  level: number;
}

export function useGame(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const gameRef = useRef<Game | null>(null);
  const [gameData, setGameData] = useState<GameStateData>({
    state: GameState.START,
    score: 0,
    lives: 3,
    powerUp: null,
    level: 1,
  });

  const initGame = useCallback(() => {
    if (!canvasRef.current) return;
    if (gameRef.current) {
      gameRef.current.destroy();
    }

    const game = new Game(canvasRef.current, {
      onScoreChange: (score) => {
        setGameData((prev) => ({ ...prev, score, level: game.getLevel() }));
      },
      onLivesChange: (lives) => {
        setGameData((prev) => ({ ...prev, lives }));
      },
      onPowerUpChange: (powerUp) => {
        setGameData((prev) => ({ ...prev, powerUp }));
      },
      onGameOver: (score) => {
        setGameData((prev) => ({ ...prev, state: GameState.GAME_OVER, score }));
      },
      onStateChange: (state) => {
        setGameData((prev) => ({ ...prev, state }));
      },
    });

    gameRef.current = game;
    return game;
  }, [canvasRef]);

  const startGame = useCallback(() => {
    const game = gameRef.current || initGame();
    if (game) {
      setGameData({
        state: GameState.PLAYING,
        score: 0,
        lives: 3,
        powerUp: null,
        level: 1,
      });
      game.start();
    }
  }, [initGame]);

  const togglePause = useCallback(() => {
    gameRef.current?.togglePause();
  }, []);

  const handleRestart = useCallback(() => {
    setGameData({
      state: GameState.START,
      score: 0,
      lives: 3,
      powerUp: null,
      level: 1,
    });
  }, []);

  const setTouch = useCallback((x: number, y: number) => {
    gameRef.current?.setTouch(x, y);
  }, []);

  const clearTouch = useCallback(() => {
    gameRef.current?.clearTouch();
  }, []);

  const setTouchFire = useCallback((firing: boolean) => {
    gameRef.current?.setTouchFire(firing);
  }, []);

  useEffect(() => {
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, []);

  return {
    gameData,
    initGame,
    startGame,
    togglePause,
    handleRestart,
    setTouch,
    clearTouch,
    setTouchFire,
  };
}
