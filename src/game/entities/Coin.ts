import * as THREE from 'three';

export interface CoinData {
  mesh: THREE.Mesh;
  velocity: THREE.Vector2;
  alive: boolean;
  amount: number;
}

function createCoinTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const cx = 32, cy = 32;

  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 32);
  bg.addColorStop(0, 'rgba(255,255,255,0.2)');
  bg.addColorStop(0.3, 'rgba(255,200,50,0.1)');
  bg.addColorStop(1, 'rgba(255,200,50,0)');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(cx, cy, 32, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffdd44';
  ctx.shadowColor = '#ffdd44';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, 15, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffcc00';
  ctx.beginPath();
  ctx.arc(cx, cy, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff8dc';
  ctx.font = 'bold 20px Courier New';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', cx, cy);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

let coinTex: THREE.CanvasTexture | null = null;

function getCoinTex(): THREE.CanvasTexture {
  if (!coinTex) coinTex = createCoinTexture();
  return coinTex;
}

export function createCoin(x: number, y: number, scale: number = 1, amount: number = 1): CoinData {
  const tex = getCoinTex();
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
    velocity: new THREE.Vector2(0, -1.5 * scale),
    alive: true,
    amount,
  };
}
