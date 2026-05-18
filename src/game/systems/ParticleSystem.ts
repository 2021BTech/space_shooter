import * as THREE from 'three';
import type { Particle } from '../types';

export class ParticleSystem {
  private particles: Particle[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
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
    const size = 0.03 + Math.random() * 0.04;
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, 0);

    this.particles.push({
      mesh,
      velocity: new THREE.Vector2((Math.random() - 0.5) * 0.5, -0.5 - Math.random()),
      life: 0.2,
      maxLife: 0.2,
    });

    this.scene.add(mesh);
  }

  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.MeshBasicMaterial).dispose();
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
  }

  clear(): void {
    for (const p of this.particles) {
      this.scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      (p.mesh.material as THREE.MeshBasicMaterial).dispose();
    }
    this.particles.length = 0;
  }

  destroy(): void {
    this.clear();
  }
}
