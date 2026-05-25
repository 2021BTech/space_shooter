import * as THREE from 'three';
import type { PowerUpType, PowerUpData } from '../types';

function createPowerUpTexture(type: PowerUpType): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 48;
  canvas.height = 48;
  const ctx = canvas.getContext('2d')!;
  const cx = 24, cy = 24;

  ctx.clearRect(0, 0, 48, 48);

  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24);
  bg.addColorStop(0, 'rgba(255,255,255,0.15)');
  bg.addColorStop(0.5, 'rgba(255,255,255,0.05)');
  bg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(cx, cy, 24, 0, Math.PI * 2);
  ctx.fill();

  switch (type) {
    case 'extra_life': {
      ctx.fillStyle = '#ff3366';
      ctx.shadowColor = '#ff3366';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 10);
      ctx.bezierCurveTo(cx - 18, cy - 6, cx - 6, cy - 18, cx, cy - 10);
      ctx.bezierCurveTo(cx + 6, cy - 18, cx + 18, cy - 6, cx, cy + 10);
      ctx.fill();
      ctx.shadowBlur = 0;
      break;
    }
    case 'spread': {
      ctx.fillStyle = '#00ff88';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 6;
      for (let i = -1; i <= 1; i++) {
        const angle = i * 0.5;
        const bx = cx + Math.sin(angle) * 12;
        const by = cy - 8 - Math.cos(angle) * 8;
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx, cy + 6);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = 'rgba(0,255,136,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      break;
    }
    case 'shield': {
      ctx.strokeStyle = '#4488ff';
      ctx.shadowColor = '#4488ff';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 16);
      ctx.lineTo(cx + 16, cy - 6);
      ctx.lineTo(cx + 16, cy + 6);
      ctx.lineTo(cx, cy + 16);
      ctx.lineTo(cx - 16, cy + 6);
      ctx.lineTo(cx - 16, cy - 6);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = 'rgba(68,136,255,0.15)';
      ctx.fill();
      ctx.shadowBlur = 0;
      break;
    }
    case 'speed': {
      ctx.fillStyle = '#ffff44';
      ctx.shadowColor = '#ffff44';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(cx + 2, cy - 16);
      ctx.lineTo(cx - 6, cy - 2);
      ctx.lineTo(cx + 1, cy - 2);
      ctx.lineTo(cx - 2, cy + 16);
      ctx.lineTo(cx + 10, cy + 2);
      ctx.lineTo(cx + 1, cy + 2);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      break;
    }
    case 'rapid': {
      ctx.fillStyle = '#ff4444';
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 6;
      for (let i = 0; i < 3; i++) {
        const r = 2 + i * 1.5;
        ctx.beginPath();
        ctx.arc(cx - 6 + i * 6, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,68,68,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + 10, cy);
      ctx.lineTo(cx + 16, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 12, cy - 3);
      ctx.lineTo(cx + 16, cy);
      ctx.lineTo(cx + 12, cy + 3);
      ctx.stroke();
      break;
    }
    case 'pierce': {
      ctx.fillStyle = '#44aaff';
      ctx.shadowColor = '#44aaff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#88ddff';
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#88ddff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 16);
      ctx.lineTo(cx, cy + 16);
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;
    }
    case 'bounce': {
      ctx.fillStyle = '#44dd66';
      ctx.shadowColor = '#44dd66';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#44dd66';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 4);
      ctx.lineTo(cx, cy + 4);
      ctx.lineTo(cx + 10, cy - 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy + 4);
      ctx.lineTo(cx, cy + 12);
      ctx.lineTo(cx + 10, cy + 4);
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;
    }
    case 'coin_magnet': {
      ctx.strokeStyle = '#ffaa44';
      ctx.shadowColor = '#ffaa44';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy - 3, 8, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + 3, 8, 0, Math.PI);
      ctx.stroke();
      ctx.fillStyle = '#ffaa44';
      ctx.beginPath();
      ctx.arc(cx, cy - 3, 8, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy + 3, 8, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffcc66';
      ctx.beginPath();
      ctx.arc(cx, cy - 3, 4, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy + 3, 4, 0, Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,170,68,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy - 8);
      ctx.lineTo(cx + 12, cy + 8);
      ctx.moveTo(cx - 12, cy + 8);
      ctx.lineTo(cx + 12, cy - 8);
      ctx.stroke();
      break;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const textureCache = new Map<PowerUpType, THREE.CanvasTexture>();

function getPowerUpTex(type: PowerUpType): THREE.CanvasTexture {
  if (!textureCache.has(type)) {
    textureCache.set(type, createPowerUpTexture(type));
  }
  return textureCache.get(type)!;
}

export function createPowerUp(type: PowerUpType, x: number, y: number, scale: number = 1): PowerUpData {
  const tex = getPowerUpTex(type);
  const s = 0.6 * scale;
  const geo = new THREE.PlaneGeometry(s, s);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, 0);
  mesh.renderOrder = 3;

  return {
    mesh,
    type,
    velocity: new THREE.Vector2(0, -1.5 * scale),
    alive: true,
  };
}
