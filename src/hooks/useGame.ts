import { useRef, useCallback, useEffect, useState } from 'react';
import { Game } from '../game/Game';
import { GameState, PowerUpType } from '../game/types';

export interface GameStateData {
  state: GameState;
  score: number;
  lives: number;
  powerUp: PowerUpType | null;
}

export function useGame(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const gameRef = useRef<Game | null>(null);
  const [gameData, setGameData] = useState<GameStateData>({
    state: GameState.START,
    score: 0,
    lives: 3,
    powerUp: null,
  });

  const initGame = useCallback(() => {
    if (!canvasRef.current) return;
    if (gameRef.current) {
      gameRef.current.destroy();
    }

    const game = new Game(canvasRef.current, {
      onScoreChange: (score) => {
        setGameData((prev) => ({ ...prev, score }));
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
      });
      game.start();
    }
  }, [initGame]);

  const handleRestart = useCallback(() => {
    setGameData({
      state: GameState.START,
      score: 0,
      lives: 3,
      powerUp: null,
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
    handleRestart,
    setTouch,
    clearTouch,
    setTouchFire,
  };
}
