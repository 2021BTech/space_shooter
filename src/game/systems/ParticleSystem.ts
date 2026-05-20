import * as THREE from 'three';
import type { Particle } from '../types';

function createScoreTexture(text: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.font = 'bold 36px Courier New';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillStyle = color;
  ctx.fillText(text, 64, 32);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff';
  ctx.fillText(text, 64, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

interface ScorePopup {
  sprite: THREE.Sprite;
  life: number;
  maxLife: number;
  baseY: number;
}

interface PoolSlot {
  mesh: THREE.Mesh;
  active: boolean;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private scorePopups: ScorePopup[] = [];
  private scene: THREE.Scene;
  private trailPool: PoolSlot[] = [];
  private readonly POOL_SIZE = 80;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    for (let i = 0; i < this.POOL_SIZE; i++) {
      const geo = new THREE.PlaneGeometry(0.03, 0.03);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x0088ff,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.trailPool.push({ mesh, active: false });
    }
  }

  createExplosion(x: number, y: number, color: number = 0xff8800, count: number = 40): void {
    for (let i = 0; i < count; i++) {
      const size = 0.04 + Math.random() * 0.08;
      const geo = new THREE.PlaneGeometry(size, size);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, 0);

      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      const life = 0.3 + Math.random() * 0.5;

      this.particles.push({
        mesh,
        velocity: new THREE.Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed),
        life,
        maxLife: life,
      });

      this.scene.add(mesh);
    }
  }

  createTrail(x: number, y: number, color: number = 0x0088ff): void {
    const slot = this.trailPool.find(s => !s.active);
    if (!slot) return;

    slot.active = true;
    const mesh = slot.mesh;
    const size = 0.03 + Math.random() * 0.04;
    mesh.scale.setScalar(size / 0.03);
    mesh.position.set(x, y, 0);
    mesh.visible = true;
    (mesh.material as THREE.MeshBasicMaterial).color.setHex(color);
    (mesh.material as THREE.MeshBasicMaterial).opacity = 0.5;

    this.particles.push({
      mesh,
      velocity: new THREE.Vector2((Math.random() - 0.5) * 0.5, -0.5 - Math.random()),
      life: 0.2,
      maxLife: 0.2,
    });
  }

  createTextPopup(x: number, y: number, text: string, color = '#ffffff'): void {
    const tex = createScoreTexture(text, color);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(x, y, 0.5);
    sprite.scale.set(2, 1, 1);
    this.scene.add(sprite);
    this.scorePopups.push({ sprite, life: 1.0, maxLife: 1.0, baseY: y });
  }

  createScorePopup(x: number, y: number, score: number): void {
    const color = score >= 300 ? '#ffdd44' : '#ffffff';
    const tex = createScoreTexture(`+${score}`, color);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(x, y, 0.5);
    sprite.scale.set(2, 1, 1);
    this.scene.add(sprite);
    this.scorePopups.push({ sprite, life: 1.0, maxLife: 1.0, baseY: y });
  }

  private releaseToPool(mesh: THREE.Mesh): void {
    mesh.visible = false;
    const slot = this.trailPool.find(s => s.mesh === mesh);
    if (slot) slot.active = false;
  }

  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        const inPool = this.trailPool.some(s => s.mesh === p.mesh);
        if (inPool) {
          this.releaseToPool(p.mesh);
        } else {
          this.scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          (p.mesh.material as THREE.MeshBasicMaterial).dispose();
        }
        this.particles.splice(i, 1);
        continue;
      }

      p.mesh.position.x += p.velocity.x * dt;
      p.mesh.position.y += p.velocity.y * dt;
      p.velocity.x *= 0.98;
      p.velocity.y *= 0.98;

      const alpha = p.life / p.maxLife;
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = alpha;
      p.mesh.scale.setScalar(0.5 + alpha * 0.5);
    }

    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      const s = this.scorePopups[i];
      s.life -= dt;
      s.sprite.position.y = s.baseY + (1 - s.life / s.maxLife) * 2;
      s.sprite.material.opacity = Math.max(0, s.life / s.maxLife);
      if (s.life <= 0 || s.sprite.material.opacity <= 0) {
        this.scene.remove(s.sprite);
        s.sprite.material.dispose();
        (s.sprite.material as THREE.SpriteMaterial).map?.dispose();
        this.scorePopups.splice(i, 1);
      }
    }
  }

  clear(): void {
    for (const p of this.particles) {
      const inPool = this.trailPool.some(s => s.mesh === p.mesh);
      if (inPool) {
        this.releaseToPool(p.mesh);
      } else {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.MeshBasicMaterial).dispose();
      }
    }
    this.particles.length = 0;
    for (const s of this.scorePopups) {
      this.scene.remove(s.sprite);
      s.sprite.material.dispose();
    }
    this.scorePopups.length = 0;
  }

  destroy(): void {
    this.clear();
    for (const slot of this.trailPool) {
      this.scene.remove(slot.mesh);
      slot.mesh.geometry.dispose();
      (slot.mesh.material as THREE.MeshBasicMaterial).dispose();
    }
    this.trailPool.length = 0;
  }
}
