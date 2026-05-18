import * as THREE from 'three';
import type {
  GameState,
  GameCallbacks,
  EnemyType,
  PowerUpType,
  BulletData,
  EnemyData,
  PowerUpData,
} from './types';
import {
  GameState as GS,
  GAME_WIDTH,
} from './types';
import { Player } from './entities/Player';
import { createBullet } from './entities/Bullet';
import { InputManager } from './systems/InputManager';
import { CollisionSystem } from './systems/CollisionSystem';
import { SpawnSystem } from './systems/SpawnSystem';
import { ParticleSystem } from './systems/ParticleSystem';
import { AudioManager } from './systems/AudioManager';
import { Starfield } from './render/Starfield';
import { EffectComposer, RenderPass, UnrealBloomPass } from 'three-stdlib';

export class Game {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private composer: EffectComposer;

  private player: Player;
  private bullets: BulletData[] = [];
  private enemies: EnemyData[] = [];
  private powerups: PowerUpData[] = [];

  private input: InputManager;
  private collision: CollisionSystem;
  private spawn: SpawnSystem;
  private particles: ParticleSystem;
  private audio: AudioManager;
  private starfield: Starfield;

  private _state: GameState = GS.START;
  private score = 0;
  private lives = 3;
  private activePowerUp: { type: PowerUpType; remaining: number } | null = null;
  private callbacks: GameCallbacks;
  private animFrameId: number = 0;
  private lastTime = 0;
  private gameHeight = 0;
  private _entityScale = 1;

  get state(): GameState {
    return this._state;
  }

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.callbacks = callbacks;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x0a0a1a);

    this.scene = new THREE.Scene();

    const aspect = canvas.clientWidth / canvas.clientHeight;
    this.gameHeight = GAME_WIDTH / aspect;
    this.camera = new THREE.OrthographicCamera(
      -GAME_WIDTH / 2,
      GAME_WIDTH / 2,
      this.gameHeight / 2,
      -this.gameHeight / 2,
      0.1,
      100
    );
    this.camera.position.z = 10;

    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
      0.3,
      0.2,
      0.1
    );
    this.composer.addPass(bloomPass);

    this.input = new InputManager();
    this.collision = new CollisionSystem();
    this.particles = new ParticleSystem(this.scene);
    this.audio = new AudioManager();

    this._entityScale = Math.max(1, Math.min(2.5, 700 / canvas.clientWidth));
    this.player = new Player(this.scene, this._entityScale);
    this.player.setBounds(GAME_WIDTH / 2, this.gameHeight / 2);

    this.starfield = new Starfield(this.scene, GAME_WIDTH / 2, this.gameHeight / 2);
    this.spawn = new SpawnSystem(this.scene, GAME_WIDTH / 2, this.gameHeight / 2);
    this.spawn.setScale(this._entityScale);

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
    this.handleResize();

    this.loop = this.loop.bind(this);
  }

  start(): void {
    this.reset();
    this._state = GS.PLAYING;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  private reset(): void {
    this.score = 0;
    this.lives = 3;
    this.activePowerUp = null;
    this.player.mesh.visible = true;
    this.player.reset();
    this.clearEntities();
    this.particles.clear();
    this.spawn.reset();
    this.callbacks.onScoreChange(0);
    this.callbacks.onLivesChange(3);
    this.callbacks.onPowerUpChange(null);
  }

  private clearEntities(): void {
    for (const b of this.bullets) {
      this.scene.remove(b.mesh);
      b.mesh.geometry.dispose();
      (b.mesh.material as THREE.MeshBasicMaterial).dispose();
    }
    this.bullets.length = 0;

    for (const e of this.enemies) {
      this.scene.remove(e.mesh);
      e.mesh.geometry.dispose();
      (e.mesh.material as THREE.MeshBasicMaterial).dispose();
    }
    this.enemies.length = 0;

    for (const p of this.powerups) {
      this.scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      (p.mesh.material as THREE.MeshBasicMaterial).dispose();
    }
    this.powerups.length = 0;
  }

  private loop(time: number): void {
    this.animFrameId = requestAnimationFrame(this.loop);

    if (this.input.consumePauseToggle()) {
      this.togglePause();
    }

    const rawDt = (time - this.lastTime) / 1000;
    const dt = Math.min(rawDt, 0.05);
    this.lastTime = time;

    if (this._state === GS.PLAYING) {
      this.update(dt);
    }

    this.starfield.update(dt);
    this.particles.update(dt);

    this.composer.render();
  }

  private update(dt: number): void {
    let dx = (this.input.left ? -1 : 0) + (this.input.right ? 1 : 0);
    let dy = (this.input.down ? -1 : 0) + (this.input.up ? 1 : 0);

    if (this.input.touchActive && dx === 0 && dy === 0) {
      dx = this.input.touchX;
      dy = this.input.touchY;
    }

    const fireResult = this.player.update(dt, dx, dy, this.input.fire);
    this.particles.createTrail(
      this.player.mesh.position.x,
      this.player.mesh.position.y - 0.5,
      0x0088ff
    );

    if (fireResult.fired) {
      this.spawnBullets(fireResult.spread);
      this.audio.playShoot();
    }

    this.updateEnemyShooting(dt);
    this.updateBullets(dt);
    this.updateEnemies(dt);
    this.updatePowerUps(dt);
    this.updateActivePowerUp(dt);
    this.difficultyScaling();
    this.checkCollisions();

    const spawnResult = this.spawn.update(dt);
    for (const e of spawnResult.newEnemies) this.enemies.push(e);
    for (const p of spawnResult.newPowerUps) this.powerups.push(p);
  }

  private spawnBullets(spread: boolean): void {
    const px = this.player.mesh.position.x;
    const py = this.player.mesh.position.y;
    const s = this._entityScale;

    if (spread) {
      for (let i = -1; i <= 1; i++) {
        const bullet = createBullet(px + i * 0.3 * s, py + 0.6 * s, false, s);
        bullet.velocity.set((Math.sin(i * 0.4) * 3 + 10) * s, 10 * s);
        this.bullets.push(bullet);
        this.scene.add(bullet.mesh);
      }
    } else {
      const bullet = createBullet(px, py + 0.6 * s, false, s);
      this.bullets.push(bullet);
      this.scene.add(bullet.mesh);
    }
  }

  private updateEnemyShooting(dt: number): void {
    const s = this._entityScale;
    for (const enemy of this.enemies) {
      if (!enemy.alive || enemy.fireInterval <= 0) continue;
      enemy.shootTimer -= dt;
      if (enemy.shootTimer <= 0) {
        enemy.shootTimer = enemy.fireInterval;
        const bullet = createBullet(enemy.mesh.position.x, enemy.mesh.position.y - 0.5 * s, true, s);
        const dx = this.player.mesh.position.x - enemy.mesh.position.x;
        const dy = this.player.mesh.position.y - enemy.mesh.position.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          bullet.velocity.set((dx / len) * 5 * s, (dy / len) * 5 * s);
        }
        this.bullets.push(bullet);
        this.scene.add(bullet.mesh);
        this.audio.playEnemyShoot();
      }
    }
  }

  private updateBullets(dt: number): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      if (!b.alive) continue;

      b.mesh.position.x += b.velocity.x * dt;
      b.mesh.position.y += b.velocity.y * dt;

      const hw = GAME_WIDTH / 2 + 1;
      const hh = this.gameHeight / 2 + 1;
      if (
        b.mesh.position.x < -hw ||
        b.mesh.position.x > hw ||
        b.mesh.position.y > hh ||
        b.mesh.position.y < -hh
      ) {
        b.alive = false;
        this.scene.remove(b.mesh);
        b.mesh.geometry.dispose();
        (b.mesh.material as THREE.MeshBasicMaterial).dispose();
        this.bullets.splice(i, 1);
      }
    }
  }

  private updateEnemies(dt: number): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (!e.alive) continue;

      if (e.type === 'fast') {
        e.mesh.position.x += Math.sin(Date.now() * 0.005 + e.mesh.position.y * 2) * dt * 2;
      }

      e.mesh.position.x += e.velocity.x * dt;
      e.mesh.position.y += e.velocity.y * dt;

      const hh = this.gameHeight / 2 + 1;
      if (e.mesh.position.y < -hh) {
        e.alive = false;
        this.scene.remove(e.mesh);
        e.mesh.geometry.dispose();
        (e.mesh.material as THREE.MeshBasicMaterial).dispose();
        this.enemies.splice(i, 1);
      }
    }
  }

  private updatePowerUps(dt: number): void {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      if (!p.alive) continue;
      p.mesh.position.y += p.velocity.y * dt;
      p.mesh.rotation.z += dt * 2;

      const hh = this.gameHeight / 2 + 1;
      if (p.mesh.position.y < -hh) {
        p.alive = false;
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.MeshBasicMaterial).dispose();
        this.powerups.splice(i, 1);
      }
    }
  }

  private updateActivePowerUp(dt: number): void {
    if (this.activePowerUp) {
      this.activePowerUp.remaining -= dt;
      if (this.activePowerUp.remaining <= 0) {
        this.player.clearPowerUp(this.activePowerUp.type);
        this.activePowerUp = null;
        this.callbacks.onPowerUpChange(null);
      }
    }
  }

  togglePause(): void {
    if (this._state === GS.PLAYING) {
      this._state = GS.PAUSED;
      this.callbacks.onStateChange(GS.PAUSED);
    } else if (this._state === GS.PAUSED) {
      this._state = GS.PLAYING;
      this.lastTime = performance.now();
      this.callbacks.onStateChange(GS.PLAYING);
    }
  }

  getLevel(): number {
    return Math.floor(this.score / 500) + 1;
  }

  private difficultyScaling(): void {
    this.spawn.setDifficulty(this.score);
  }

  private removeBullet(bullet: BulletData): void {
    bullet.alive = false;
    this.scene.remove(bullet.mesh);
    bullet.mesh.geometry.dispose();
    (bullet.mesh.material as THREE.MeshBasicMaterial).dispose();
  }

  private removeEnemy(enemy: EnemyData): void {
    enemy.alive = false;
    this.scene.remove(enemy.mesh);
    enemy.mesh.geometry.dispose();
    (enemy.mesh.material as THREE.MeshBasicMaterial).dispose();
  }

  private checkCollisions(): void {
    const bulletEnemyHits = this.collision.checkBulletEnemy(this.bullets, this.enemies);
    for (const hit of bulletEnemyHits) {
      const bullet = this.bullets[hit.bulletIdx];
      const enemy = this.enemies[hit.enemyIdx];

      if (bullet.alive && enemy.alive) {
        this.removeBullet(bullet);
        enemy.hp--;

        if (enemy.hp <= 0) {
          this.removeEnemy(enemy);
          this.score += this.getScoreForEnemy(enemy.type);
          this.callbacks.onScoreChange(this.score);
          this.particles.createExplosion(
            enemy.mesh.position.x,
            enemy.mesh.position.y,
            this.getExplosionColor(enemy.type),
            50
          );
          this.audio.playExplosion();
        } else {
          this.particles.createExplosion(
            enemy.mesh.position.x,
            enemy.mesh.position.y,
            0xffff00,
            10
          );
        }
      }
    }

    const enemyPlayerHits = this.collision.checkEnemyPlayer(
      this.enemies,
      this.player.mesh.position
    );
    for (const idx of enemyPlayerHits) {
      const enemy = this.enemies[idx];
      if (!enemy.alive) continue;
      this.removeEnemy(enemy);
      this.particles.createExplosion(
        enemy.mesh.position.x,
        enemy.mesh.position.y,
        0xff4400,
        60
      );

      if (this.player.shieldActive) {
        this.player.shieldActive = false;
        if (this.activePowerUp && this.activePowerUp.type === 'shield') {
          this.activePowerUp = null;
          this.callbacks.onPowerUpChange(null);
        }
        this.audio.playExplosion();
      } else {
        this.playerHit();
      }
    }

    const enemyBulletHits = this.collision.checkEnemyBulletPlayer(
      this.bullets,
      this.player.mesh.position
    );
    for (const idx of enemyBulletHits) {
      const bullet = this.bullets[idx];
      if (!bullet.alive) continue;
      this.removeBullet(bullet);

      if (this.player.shieldActive) {
        this.player.shieldActive = false;
        if (this.activePowerUp && this.activePowerUp.type === 'shield') {
          this.activePowerUp = null;
          this.callbacks.onPowerUpChange(null);
        }
        this.audio.playExplosion();
      } else {
        this.playerHit();
      }
    }

    const powerUpHits = this.collision.checkPlayerPowerUp(
      this.powerups,
      this.player.mesh.position
    );
    for (const idx of powerUpHits) {
      const powerup = this.powerups[idx];
      if (!powerup.alive) continue;
      powerup.alive = false;

      if (this.activePowerUp) {
        this.player.clearPowerUp(this.activePowerUp.type);
      }

      this.activePowerUp = {
        type: powerup.type,
        remaining: 8,
      };
      this.player.applyPowerUp(powerup.type);
      this.callbacks.onPowerUpChange(powerup.type);
      this.audio.playPowerUp();
      this.particles.createExplosion(
        powerup.mesh.position.x,
        powerup.mesh.position.y,
        this.getPowerUpColor(powerup.type),
        20
      );
      this.scene.remove(powerup.mesh);
      powerup.mesh.geometry.dispose();
      (powerup.mesh.material as THREE.MeshBasicMaterial).dispose();
    }
  }

  private playerHit(): void {
    this.lives--;
    this.callbacks.onLivesChange(this.lives);
    this.audio.playHit();

    if (this.lives <= 0) {
      this.particles.createExplosion(
        this.player.mesh.position.x,
        this.player.mesh.position.y,
        0xff4400,
        120
      );
      this.particles.createExplosion(
        this.player.mesh.position.x,
        this.player.mesh.position.y,
        0xffff44,
        80
      );
      this.player.mesh.visible = false;
      this.audio.playGameOver();
      this._state = GS.GAME_OVER;
      this.callbacks.onGameOver(this.score);
    } else {
      this.player.mesh.position.set(0, -4, 0);
    }
  }

  private getScoreForEnemy(type: EnemyType): number {
    switch (type) {
      case 'basic': return 100;
      case 'shooter': return 200;
      case 'fast': return 150;
      case 'tank': return 300;
    }
  }

  private getExplosionColor(type: EnemyType): number {
    switch (type) {
      case 'basic': return 0xff4444;
      case 'shooter': return 0xff8800;
      case 'fast': return 0xffff44;
      case 'tank': return 0xaa2222;
    }
  }

  private getPowerUpColor(type: PowerUpType): number {
    switch (type) {
      case 'spread': return 0x00ff88;
      case 'shield': return 0x4488ff;
      case 'speed': return 0xffff44;
      case 'rapid': return 0xff4444;
    }
  }

  private handleResize(): void {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height !== height) {
      this.renderer.setSize(width, height, false);
      this.composer.setSize(width, height);

      const aspect = width / height;
      this.gameHeight = GAME_WIDTH / aspect;
      this.camera.left = -GAME_WIDTH / 2;
      this.camera.right = GAME_WIDTH / 2;
      this.camera.top = this.gameHeight / 2;
      this.camera.bottom = -this.gameHeight / 2;
      this.camera.updateProjectionMatrix();

      const bloom = this.composer.passes[1] as UnrealBloomPass;
      bloom.resolution.set(width, height);

      this._entityScale = Math.max(1, Math.min(2.5, 700 / width));
      this.player.setBounds(GAME_WIDTH / 2, this.gameHeight / 2);
      this.starfield.resize(GAME_WIDTH / 2, this.gameHeight / 2);
      this.spawn.setSize(GAME_WIDTH / 2, this.gameHeight / 2);
      this.spawn.setScale(this._entityScale);
    }
  }

  setTouch(x: number, y: number): void {
    this.input.setTouch(x, y);
  }

  clearTouch(): void {
    this.input.clearTouch();
  }

  setTouchFire(firing: boolean): void {
    this.input.setTouchFire(firing);
  }

  destroy(): void {
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.handleResize);
    this.input.destroy();
    this.player.destroy(this.scene);
    this.clearEntities();
    this.particles.destroy();
    this.starfield.destroy();
    this.spawn.destroy();
    this.audio.destroy();
    this.composer.dispose();
    this.renderer.dispose();
  }
}
