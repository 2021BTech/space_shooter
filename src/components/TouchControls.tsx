import { useCallback, useRef } from 'react';

interface TouchControlsProps {
  onTouch: (x: number, y: number) => void;
  onTouchEnd: () => void;
  onFire: (firing: boolean) => void;
}

export function TouchControls({ onTouch, onTouchEnd, onFire }: TouchControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);
  const centerRef = useRef({ x: 0, y: 0 });

  const getTouchById = (touches: React.TouchList, id: number): React.Touch | undefined => {
    for (let i = 0; i < touches.length; i++) {
      if (touches[i].identifier === id) return touches[i];
    }
    return undefined;
  };

  const handleJoystickStart = useCallback((e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    const el = joystickRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

  const handleJoystickMove = useCallback((e: React.TouchEvent) => {
    if (touchIdRef.current === null) return;
    const touch = getTouchById(e.changedTouches, touchIdRef.current);
    if (!touch || !knobRef.current) return;

    const dx = touch.clientX - centerRef.current.x;
    const dy = touch.clientY - centerRef.current.y;
    const maxDist = 40;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, maxDist);
    const angle = Math.atan2(dy, dx);

    const nx = (clampedDist / maxDist) * Math.cos(angle);
    const ny = (clampedDist / maxDist) * Math.sin(angle);

    knobRef.current.style.transform = `translate(${nx}px, ${ny}px)`;
    onTouch(nx, -ny);
  }, [onTouch]);

  const handleJoystickEnd = useCallback(() => {
    touchIdRef.current = null;
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)';
    }
    onTouchEnd();
  }, [onTouchEnd]);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 15,
    }}>
      <div
        ref={joystickRef}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
        style={{
          position: 'absolute',
          bottom: 30,
          left: 30,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          border: '2px solid rgba(255,255,255,0.15)',
          pointerEvents: 'auto',
          touchAction: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          ref={knobRef}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'transform 0.05s',
          }}
        />
      </div>

      <div
        onTouchStart={() => onFire(true)}
        onTouchEnd={() => onFire(false)}
        onTouchCancel={() => onFire(false)}
        style={{
          position: 'absolute',
          bottom: 30,
          right: 30,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,50,50,0.25), rgba(255,50,50,0.1))',
          border: '2px solid rgba(255,50,50,0.3)',
          pointerEvents: 'auto',
          touchAction: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.4)',
          fontSize: 11,
          fontFamily: "'Courier New', monospace",
          letterSpacing: 1,
          userSelect: 'none',
        }}
      >
        FIRE
      </div>
    </div>
  );
}
