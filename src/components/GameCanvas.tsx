import { useEffect } from 'react';
import { GameState } from '../game/types';

interface GameCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  initGame: () => void;
  gameState: GameState;
}

export function GameCanvas({ canvasRef, initGame, gameState }: GameCanvasProps) {
  useEffect(() => {
    initGame();
  }, [initGame]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: gameState === GameState.PLAYING ? 'none' : 'default',
        }}
      />
    </div>
  );
}
