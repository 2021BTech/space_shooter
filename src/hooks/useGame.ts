import { useRef, useCallback, useEffect, useState } from 'react';
import { Game } from '../game/Game';
import { GameState, PowerUpType, emptyStats } from '../game/types';
import type { RunStats, Difficulty } from '../game/types';
import type { RunUpgrades } from '../components/UpgradeShop';
import { Settings } from '../services/settingsService';

export interface GameStateData {
  state: GameState;
  score: number;
  lives: number;
  powerUp: PowerUpType | null;
  level: number;
  runCoins: number;
  runStats: RunStats;
  autoFire: boolean;
}

export function useGame(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const gameRef = useRef<Game | null>(null);
  const [muted, setMuted] = useState(() => Settings.muted);
  const [gameData, setGameData] = useState<GameStateData>({
    state: GameState.START,
    score: 0,
    lives: 3,
    powerUp: null,
    level: 1,
    runCoins: 0,
    runStats: emptyStats(),
    autoFire: false,
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
      onGameOver: (score, stats) => {
        setGameData((prev) => {
          Settings.coins += prev.runCoins;
          return { ...prev, state: GameState.GAME_OVER, score, runStats: stats };
        });
      },
      onStateChange: (state) => {
        setGameData((prev) => ({ ...prev, state }));
      },
      onLevelUp: (level) => {
        setGameData((prev) => ({ ...prev, level }));
      },
      onCoinsChange: (coins) => {
        setGameData((prev) => ({ ...prev, runCoins: coins }));
      },
      onAutoFireChange: (active) => {
        setGameData((prev) => ({ ...prev, autoFire: active }));
      },
    });

    gameRef.current = game;
    return game;
  }, [canvasRef]);

  const startUpgrade = useCallback(() => {
    const game = gameRef.current || initGame();
    if (game) {
      setGameData((prev) => ({ ...prev, state: GameState.UPGRADE, runCoins: 0 }));
    }
  }, [initGame]);

  const startGame = useCallback((upgrades?: RunUpgrades, difficulty?: Difficulty) => {
    const game = gameRef.current;
    if (!game) return;

    const baseLives = 3;
    const lives = baseLives + (upgrades?.extraLife || 0);

    setGameData({
      state: GameState.PLAYING,
      score: 0,
      lives,
      powerUp: null,
      level: 1,
      runCoins: 0,
      runStats: emptyStats(),
      autoFire: Settings.autoFirePurchased,
    });

    const autoFire = Settings.autoFirePurchased;
    game.start(difficulty, autoFire);

    if (upgrades?.shield) game.applyRunUpgrade('shield');
    if (upgrades?.spread) game.applyRunUpgrade('spread');
    if (upgrades?.speed) game.applyRunUpgrade('speed');
  }, []);

  const togglePause = useCallback(() => {
    gameRef.current?.togglePause();
  }, []);

  const toggleMute = useCallback(() => {
    gameRef.current?.toggleMute();
    setMuted((m) => {
      const next = !m;
      Settings.muted = next;
      return next;
    });
  }, []);

  const handleRestart = useCallback(() => {
    setGameData({
      state: GameState.START,
      score: 0,
      lives: 3,
      powerUp: null,
      level: 1,
      runCoins: 0,
      runStats: emptyStats(),
      autoFire: false,
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
  };
}
