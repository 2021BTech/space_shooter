import * as THREE from 'three';
import type { PowerUpType, PowerUpData } from '../types';

function createPowerUpTexture(type: PowerUpType): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 48;
  canvas.height = 48;
  const ctx = canvas.getContext('2d')!;
  const cx = 24, cy = 24;

  let color1 = '#00ff88', color2 = '#00aa44';

  switch (type) {
    case 'spread':
      color1 = '#00ff88';
      color2 = '#009944';
      break;
    case 'shield':
      color1 = '#4488ff';
      color2 = '#0044cc';
      break;
    case 'speed':
      color1 = '#ffff44';
      color2 = '#ccaa00';
      break;
    case 'rapid':
      color1 = '#ff4444';
      color2 = '#cc0000';
      break;
  }

  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.2, color1);
  g.addColorStop(0.6, color2);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, 24, 0, Math.PI * 2);
  ctx.fill();

  const letter = type === 'spread' ? 'S' :
    type === 'shield' ? 'D' :
    type === 'speed' ? '>' :
    'R';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, cx, cy);

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

export function createPowerUp(type: PowerUpType, x: number, y: number): PowerUpData {
  const tex = getPowerUpTex(type);
  const geo = new THREE.PlaneGeometry(0.6, 0.6);
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
    velocity: new THREE.Vector2(0, -1.5),
    alive: true,
  };
}
