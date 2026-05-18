import * as THREE from 'three';
import { PLAYER_SPEED } from '../types';

export function createPlayerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const cx = 32, cy = 32;

  const gradient = ctx.createLinearGradient(0, 0, 64, 64);
  gradient.addColorStop(0, '#00ccff');
  gradient.addColorStop(0.5, '#0088ff');
  gradient.addColorStop(1, '#0044aa');
  ctx.fillStyle = gradient;

  ctx.beginPath();
  ctx.moveTo(cx, cy - 24);
  ctx.lineTo(cx + 20, cy + 16);
  ctx.lineTo(cx + 8, cy + 8);
  ctx.lineTo(cx + 8, cy + 24);
  ctx.lineTo(cx, cy + 20);
  ctx.lineTo(cx - 8, cy + 24);
  ctx.lineTo(cx - 8, cy + 8);
  ctx.lineTo(cx - 20, cy + 16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#00eeff';
  ctx.beginPath();
  ctx.arc(cx, cy - 8, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#88eeff';
  ctx.lineWidth = 1;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export class Player {
  mesh: THREE.Mesh;
  speed = PLAYER_SPEED;
  alive = true;
  fireTimer = 0;
  fireInterval = 0.25;
  spreadActive = false;
  rapidActive = false;
  shieldActive = false;
  private bounds: { left: number; right: number; top: number; bottom: number };
  private shieldMesh: THREE.Mesh | null = null;
  private engineGlow: THREE.Mesh | null = null;

  constructor(scene: THREE.Scene, s: number = 1) {
    const tex = createPlayerTexture();
    const geo = new THREE.PlaneGeometry(1.2 * s, 1.2 * s);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.set(0, -4, 0);
    this.mesh.renderOrder = 1;
    scene.add(this.mesh);

    const glowGeo = new THREE.PlaneGeometry(1.6 * s, 1.6 * s);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.engineGlow = new THREE.Mesh(glowGeo, glowMat);
    this.engineGlow.position.set(0, -4, -0.1);
    this.engineGlow.renderOrder = 0;
    scene.add(this.engineGlow);

    const shieldCanvas = document.createElement('canvas');
    shieldCanvas.width = 64;
    shieldCanvas.height = 64;
    const sctx = shieldCanvas.getContext('2d')!;
    const sgrad = sctx.createRadialGradient(32, 32, 10, 32, 32, 32);
    sgrad.addColorStop(0, 'rgba(0, 200, 255, 0)');
    sgrad.addColorStop(0.5, 'rgba(0, 200, 255, 0.3)');
    sgrad.addColorStop(0.8, 'rgba(0, 200, 255, 0.6)');
    sgrad.addColorStop(1, 'rgba(0, 200, 255, 0)');
    sctx.fillStyle = sgrad;
    sctx.beginPath();
    sctx.arc(32, 32, 32, 0, Math.PI * 2);
    sctx.fill();
    const shieldTex = new THREE.CanvasTexture(shieldCanvas);
    shieldTex.needsUpdate = true;

    const shieldGeo = new THREE.PlaneGeometry(2.0 * s, 2.0 * s);
    const shieldMat = new THREE.MeshBasicMaterial({
      map: shieldTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      visible: false,
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.set(0, -4, 0.1);
    this.shieldMesh.renderOrder = 2;
    scene.add(this.shieldMesh);

    this.bounds = { left: -8, right: 8, top: 5, bottom: -5 };
  }

  setBounds(width: number, height: number): void {
    this.bounds = {
      left: -width + 1,
      right: width - 1,
      top: height - 1,
      bottom: -height + 1,
    };
  }

  update(dt: number, dx: number, dy: number, firePressed: boolean): { fired: boolean; spread: boolean } {
    if (!this.alive) return { fired: false, spread: false };

    this.mesh.position.x += dx * this.speed * dt;
    this.mesh.position.y += dy * this.speed * dt;

    this.mesh.position.x = Math.max(this.bounds.left, Math.min(this.bounds.right, this.mesh.position.x));
    this.mesh.position.y = Math.max(this.bounds.bottom, Math.min(this.bounds.top, this.mesh.position.y));

    if (this.engineGlow) {
      this.engineGlow.position.copy(this.mesh.position);
      this.engineGlow.position.z = -0.1;
      const pulse = 0.1 + Math.sin(Date.now() * 0.01) * 0.05;
      (this.engineGlow.material as THREE.MeshBasicMaterial).opacity = pulse;
    }

    if (this.shieldMesh) {
      this.shieldMesh.position.copy(this.mesh.position);
      this.shieldMesh.position.z = 0.1;
      this.shieldMesh.rotation.z += dt * 2;
      (this.shieldMesh.material as THREE.MeshBasicMaterial).visible = this.shieldActive;
    }

    this.fireTimer -= dt;
    let fired = false;
    const spread = this.spreadActive;

    if (firePressed && this.fireTimer <= 0) {
      const interval = this.rapidActive ? 0.08 : this.fireInterval;
      this.fireTimer = interval;
      fired = true;
    }

    return { fired, spread };
  }

  applyPowerUp(type: string): void {
    if (type === 'spread') this.spreadActive = true;
    if (type === 'speed') this.speed = PLAYER_SPEED * 1.5;
    if (type === 'shield') this.shieldActive = true;
    if (type === 'rapid') this.rapidActive = true;
  }

  clearPowerUp(type: string): void {
    if (type === 'spread') this.spreadActive = false;
    if (type === 'speed') this.speed = PLAYER_SPEED;
    if (type === 'shield') this.shieldActive = false;
    if (type === 'rapid') this.rapidActive = false;
  }

  reset(): void {
    this.mesh.position.set(0, -4, 0);
    this.alive = true;
    this.fireTimer = 0;
    this.speed = PLAYER_SPEED;
    this.spreadActive = false;
    this.rapidActive = false;
    this.shieldActive = false;
    if (this.shieldMesh) (this.shieldMesh.material as THREE.MeshBasicMaterial).visible = false;
  }

  destroy(scene: THREE.Scene): void {
    scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.MeshBasicMaterial).dispose();
    if (this.engineGlow) {
      scene.remove(this.engineGlow);
      this.engineGlow.geometry.dispose();
      (this.engineGlow.material as THREE.MeshBasicMaterial).dispose();
    }
    if (this.shieldMesh) {
      scene.remove(this.shieldMesh);
      this.shieldMesh.geometry.dispose();
      (this.shieldMesh.material as THREE.MeshBasicMaterial).dispose();
    }
  }
}
