import * as THREE from 'three';
import type {
  GameState,
  GameCallbacks,
  EnemyType,
  PowerUpType,
  BulletData,
  EnemyData,
  PowerUpData,
  CoinData,
  RunStats,
  Difficulty,
  BulletType,
} from './types';
import {
  GameState as GS,
  GAME_WIDTH,
  PLAYER_SPEED,
  emptyStats,
  getLevelFromScore,
} from './types';
import { Player } from './entities/Player';
import { createBullet } from './entities/Bullet';
import { createCoin } from './entities/Coin';
import { InputManager } from './systems/InputManager';
import { CollisionSystem } from './systems/CollisionSystem';
import { SpawnSystem } from './systems/SpawnSystem';
import { ParticleSystem } from './systems/ParticleSystem';
import { AudioManager } from './systems/AudioManager';
import { Starfield } from './render/Starfield';
import { EffectComposer, RenderPass, UnrealBloomPass } from 'three-stdlib';

const DIFFICULTY_CONFIG: Record<Difficulty, { lives: number; scoreMult: number; playerSpeedMult: number }> = {
  easy: { lives: 3, scoreMult: 1.5, playerSpeedMult: 1.0 },
  medium: { lives: 3, scoreMult: 1.0, playerSpeedMult: 1.0 },
  hard: { lives: 3, scoreMult: 0.7, playerSpeedMult: 1.2 },
};

export class Game {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private composer: EffectComposer;

  private player: Player;
  private bullets: BulletData[] = [];
  private enemies: EnemyData[] = [];
  private powerups: PowerUpData[] = [];
  private coins: CoinData[] = [];
  private coinsCollected = 0;

  private input: InputManager;
  private collision: CollisionSystem;
  private spawn: SpawnSystem;
  private particles: ParticleSystem;
  private audio: AudioManager;
  private starfield: Starfield;

  private _state: GameState = GS.START;
  private score = 0;
  private currentLevel = 1;
  private lives = 3;
  private activePowerUp: { type: PowerUpType; remaining: number } | null = null;
  private hitStopTimer = 0;
  private shakeIntensity = 0;
  private comboCount = 0;
  private comboTimer = 0;
  private gameOverTimer = 0;
  private cameraBaseX = 0;
  private cameraBaseY = 0;
  private callbacks: GameCallbacks;
  private animFrameId: number = 0;
  private lastTime = 0;
  private gameHeight = 0;
  private _entityScale = 1;
  private stats: RunStats = emptyStats();
  private runDuration = 0;
  private difficulty: Difficulty = 'medium';
  private scoreMult = 1.0;
  private autoFire = false;
  powerupTypesCollected: Set<string> = new Set();

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
    this.cameraBaseX = this.camera.position.x;
    this.cameraBaseY = this.camera.position.y;

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

  start(difficulty?: Difficulty, autoFire?: boolean): void {
    if (difficulty) {
      this.difficulty = difficulty;
      this.spawn.setDifficultyMode(difficulty);
    }
    this.autoFire = autoFire ?? false;
    this.callbacks.onAutoFireChange?.(this.autoFire);
    this.reset();
    this._state = GS.PLAYING;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  private reset(): void {
    const config = DIFFICULTY_CONFIG[this.difficulty];
    this.score = 0;
    this.currentLevel = 1;
    this.lives = config.lives;
    this.scoreMult = config.scoreMult;
    this.activePowerUp = null;
    this.player.mesh.visible = true;
    this.player.reset();
    this.player.autoFire = this.autoFire;
    this.player.speed = PLAYER_SPEED * config.playerSpeedMult;
    this.clearEntities();
    this.particles.clear();
    this.spawn.reset();
    this.coinsCollected = 0;
    this.stats = emptyStats();
    this.runDuration = 0;
    this.powerupTypesCollected = new Set();
    this.callbacks.onCoinsChange?.(0);
    this.hitStopTimer = 0;
    this.shakeIntensity = 0;
    this.gameOverTimer = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.callbacks.onScoreChange(0);
    this.callbacks.onLivesChange(config.lives);
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

    for (const c of this.coins) {
      this.scene.remove(c.mesh);
      c.mesh.geometry.dispose();
      (c.mesh.material as THREE.MeshBasicMaterial).dispose();
    }
    this.coins.length = 0;
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

    const px = this.player.mesh.position.x;
    const py = this.player.mesh.position.y;
    this.starfield.update(dt, px, py);
    this.particles.update(dt);

    if (this.shakeIntensity > 0) {
      const sx = (Math.random() - 0.5) * this.shakeIntensity * 0.3;
      const sy = (Math.random() - 0.5) * this.shakeIntensity * 0.3;
      this.camera.position.x = this.cameraBaseX + sx;
      this.camera.position.y = this.cameraBaseY + sy;
      this.shakeIntensity *= 0.9;
      if (this.shakeIntensity < 0.01) this.shakeIntensity = 0;
    } else {
      this.camera.position.x = this.cameraBaseX;
      this.camera.position.y = this.cameraBaseY;
    }

    this.composer.render();
  }

  private update(dt: number): void {
    if (this.gameOverTimer > 0) {
      this.gameOverTimer -= dt;
      this.shakeIntensity = Math.max(this.shakeIntensity, 0.8);
      if (this.gameOverTimer <= 0) {
        this._state = GS.GAME_OVER;
        this.callbacks.onGameOver(this.score, {
          ...this.stats,
          powerupTypes: Array.from(this.powerupTypesCollected),
        });
      }
    } else if (this.hitStopTimer > 0) {
      dt *= 0.08;
      this.hitStopTimer -= dt;
    }

    this.runDuration += dt;
    this.stats.timeSurvived = this.runDuration;

    this.comboTimer -= dt;
    if (this.comboTimer <= 0) {
      this.comboCount = 0;
    }

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
    this.updateCoins(dt);
    this.updateActivePowerUp(dt);
    this.difficultyScaling();
    this.checkCollisions();
    this.checkLevelUp();

    const spawnResult = this.spawn.update(dt);
    for (const e of spawnResult.newEnemies) this.enemies.push(e);
    for (const p of spawnResult.newPowerUps) this.powerups.push(p);
  }

  private getPlayerBulletType(): BulletType {
    if (this.player.pierceActive) return 'pierce';
    if (this.player.bounceActive) return 'bounce';
    return 'normal';
  }

  private spawnBullets(spread: boolean): void {
    const px = this.player.mesh.position.x;
    const py = this.player.mesh.position.y;
    const s = this._entityScale;
    const bulletType = this.getPlayerBulletType();

    if (spread) {
      const count = 5;
      const spreadAngle = 0.6;
      for (let i = 0; i < count; i++) {
        const t = (i / (count - 1)) - 0.5;
        const angle = t * spreadAngle;
        const bullet = createBullet(px, py + 0.6 * s, false, s, bulletType);
        bullet.velocity.set(Math.sin(angle) * 10 * s, Math.cos(angle) * 10 * s);
        this.bullets.push(bullet);
        this.scene.add(bullet.mesh);
      }
    } else {
      const bullet = createBullet(px, py + 0.6 * s, false, s, bulletType);
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

        if (enemy.type === 'boss') {
          for (let i = -2; i <= 2; i++) {
            const bullet = createBullet(enemy.mesh.position.x, enemy.mesh.position.y - 0.5 * s, true, s);
            const dx = this.player.mesh.position.x - enemy.mesh.position.x;
            const dy = this.player.mesh.position.y - enemy.mesh.position.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) {
              const angle = Math.atan2(dy, dx) + i * 0.2;
              bullet.velocity.set(Math.cos(angle) * 5 * s, Math.sin(angle) * 5 * s);
            }
            this.bullets.push(bullet);
            this.scene.add(bullet.mesh);
          }
          this.audio.playEnemyShoot();
        } else {
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
  }

  private updateBullets(dt: number): void {
    const hw = GAME_WIDTH / 2 + 1;
    const hh = this.gameHeight / 2 + 1;

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      if (!b.alive) continue;

      b.mesh.position.x += b.velocity.x * dt;
      b.mesh.position.y += b.velocity.y * dt;

      if (b.bulletType === 'bounce' && !b.isEnemy) {
        if (b.mesh.position.x < -hw || b.mesh.position.x > hw) {
          b.velocity.x *= -1;
          b.mesh.position.x = Math.max(-hw, Math.min(hw, b.mesh.position.x));
        }
      }

      if (
        b.mesh.position.x < -hw - 1 ||
        b.mesh.position.x > hw + 1 ||
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

  private updateCoins(dt: number): void {
    const px = this.player.mesh.position.x;
    const py = this.player.mesh.position.y;
    const hh = this.gameHeight / 2 + 1;

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (!c.alive) {
        this.scene.remove(c.mesh);
        c.mesh.geometry.dispose();
        (c.mesh.material as THREE.MeshBasicMaterial).dispose();
        this.coins.splice(i, 1);
        continue;
      }

      c.mesh.position.y += c.velocity.y * dt;
      c.mesh.rotation.z += dt * 2;

      const dx = px - c.mesh.position.x;
      const dy = py - c.mesh.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const magnetRange = this.player.coinMagnetActive ? 3.0 : 0.9;
      if (this.player.coinMagnetActive && dist < magnetRange && dist >= 0.9) {
        const pull = 4 * dt;
        c.mesh.position.x += dx * pull;
        c.mesh.position.y += dy * pull;
      }
      if (dist < 0.9) {
        c.alive = false;
        this.coinsCollected += c.amount;
        this.callbacks.onCoinsChange?.(this.coinsCollected);
        this.particles.createExplosion(c.mesh.position.x, c.mesh.position.y, 0xffdd44, 12);
        this.audio.playPowerUp();
      }

      if (c.mesh.position.y < -hh) {
        c.alive = false;
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
    return getLevelFromScore(this.score);
  }

  private difficultyScaling(): void {
    this.spawn.setDifficulty(this.currentLevel);
  }

  private triggerHitStop(duration: number): void {
    this.hitStopTimer = duration;
  }

  private triggerShake(intensity: number): void {
    this.shakeIntensity = intensity;
  }

  private getComboMultiplier(): number {
    return Math.min(this.comboCount, 5);
  }

  private checkLevelUp(): void {
    const newLevel = getLevelFromScore(this.score);
    if (newLevel > this.currentLevel) {
      this.currentLevel = newLevel;
      this.callbacks.onLevelUp?.(newLevel);
      if (newLevel >= 3 && !this.autoFire) {
        this.player.autoFire = true;
        this.callbacks.onAutoFireChange?.(true);
      }
    }
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
        if (bullet.bulletType === 'pierce' && !bullet.isEnemy) {
          bullet.pierceHits++;
          if (bullet.pierceHits >= 3) {
            this.removeBullet(bullet);
          }
        } else if (bullet.bulletType === 'bounce' && !bullet.isEnemy) {
          this.removeBullet(bullet);
        } else {
          this.removeBullet(bullet);
        }
        enemy.hp--;

        if (enemy.hp <= 0) {
          this.removeEnemy(enemy);
          this.comboCount++;
          this.comboTimer = 1.0;
          this.stats.enemiesKilled++;
          this.stats.killsByType[enemy.type]++;
          if (enemy.type === 'boss') this.stats.bossKills++;
          this.stats.maxCombo = Math.max(this.stats.maxCombo, this.comboCount);
          const comboMult = this.getComboMultiplier();
          const baseScore = this.getScoreForEnemy(enemy.type);
          const scoreValue = Math.floor(baseScore * comboMult * this.scoreMult);
          this.score += scoreValue;
          this.callbacks.onScoreChange(this.score);
          const displayScore = Math.floor(baseScore * comboMult * this.scoreMult);
          this.particles.createScorePopup(enemy.mesh.position.x, enemy.mesh.position.y, displayScore);
          if (comboMult > 1) {
            this.particles.createTextPopup(
              enemy.mesh.position.x, enemy.mesh.position.y - 0.6,
              `x${comboMult}`, '#ffdd44'
            );
          }
          this.particles.createExplosion(
            enemy.mesh.position.x,
            enemy.mesh.position.y,
            this.getExplosionColor(enemy.type),
            50
          );
          this.audio.playExplosion();
          this.triggerShake(0.15);

          if (enemy.type === 'boss') {
            const bossCoins = 50 + Math.floor(Math.random() * 51);
            for (let i = 0; i < Math.min(bossCoins, 10); i++) {
              const coin = createCoin(
                enemy.mesh.position.x + (Math.random() - 0.5) * 2,
                enemy.mesh.position.y + (Math.random() - 0.5) * 2,
                this._entityScale,
                1
              );
              this.coins.push(coin);
              this.scene.add(coin.mesh);
            }
            this.particles.createTextPopup(
              enemy.mesh.position.x, enemy.mesh.position.y + 1.5,
              `+${bossCoins} COINS`, '#ffdd44'
            );
            this.particles.createExplosion(enemy.mesh.position.x, enemy.mesh.position.y, 0xff0066, 120);
            this.triggerShake(1.0);
          } else {
            const coinRate = this.difficulty === 'easy' ? 0.2 : this.difficulty === 'medium' ? 0.1 : 0.05;
            if (Math.random() < coinRate) {
              const coin = createCoin(enemy.mesh.position.x, enemy.mesh.position.y, this._entityScale, 1);
              this.coins.push(coin);
              this.scene.add(coin.mesh);
            }
          }
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
      if (!enemy.alive || this.player.invincible) continue;
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
      if (!bullet.alive || this.player.invincible) continue;
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

      this.stats.powerupsCollected++;
      this.powerupTypesCollected.add(powerup.type);

      if (powerup.type === 'extra_life') {
        this.lives = Math.min(this.lives + 1, 5);
        this.callbacks.onLivesChange(this.lives);
        this.audio.playPowerUp();
      } else if (powerup.type === 'pierce' || powerup.type === 'bounce') {
        if (this.activePowerUp) {
          this.player.clearPowerUp(this.activePowerUp.type);
        }
        this.player.applyPowerUp(powerup.type);
        this.callbacks.onPowerUpChange(powerup.type);
        this.audio.playPowerUp();
      } else {
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
      }

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
    this.player.flashHit();
    this.triggerShake(0.5);
    this.triggerHitStop(0.12);
    this.comboCount = 0;
    this.comboTimer = 0;

    if (this.lives <= 0) {
      this.particles.createExplosion(
        this.player.mesh.position.x,
        this.player.mesh.position.y,
        0xff4400,
        60
      );
      this.particles.createExplosion(
        this.player.mesh.position.x,
        this.player.mesh.position.y,
        0xffff44,
        40
      );
      this.player.mesh.visible = false;
      this.audio.playGameOver();
      this.gameOverTimer = 2.0;
    } else {
      this.player.mesh.position.set(0, -4, 0);
      this.player.setInvincible(2);
    }
  }

  private getScoreForEnemy(type: EnemyType): number {
    switch (type) {
      case 'basic': return 100;
      case 'shooter': return 200;
      case 'fast': return 150;
      case 'tank': return 300;
      case 'swarm': return 50;
      case 'boss': return 1000;
    }
  }

  private getExplosionColor(type: EnemyType): number {
    switch (type) {
      case 'basic': return 0xff4444;
      case 'shooter': return 0xff8800;
      case 'fast': return 0xffff44;
      case 'tank': return 0xaa2222;
      case 'swarm': return 0x88ff00;
      case 'boss': return 0xff0066;
    }
  }

  private getPowerUpColor(type: PowerUpType): number {
    switch (type) {
      case 'spread': return 0x00ff88;
      case 'shield': return 0x4488ff;
      case 'speed': return 0xffff44;
      case 'rapid': return 0xff4444;
      case 'extra_life': return 0xff3366;
      case 'pierce': return 0x44aaff;
      case 'bounce': return 0x44dd66;
      case 'coin_magnet': return 0xffaa44;
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
      this.cameraBaseX = this.camera.position.x;
      this.cameraBaseY = this.camera.position.y;

      const bloom = this.composer.passes[1] as UnrealBloomPass;
      bloom.resolution.set(width, height);

      this._entityScale = Math.max(1, Math.min(2.5, 700 / width));
      this.player.setBounds(GAME_WIDTH / 2, this.gameHeight / 2);
      this.starfield.resize(GAME_WIDTH / 2, this.gameHeight / 2);
      this.spawn.setSize(GAME_WIDTH / 2, this.gameHeight / 2);
      this.spawn.setScale(this._entityScale);
    }
  }

  toggleMute(): void {
    this.audio.toggleMute();
  }

  get isMuted(): boolean {
    return this.audio.muted;
  }

  setActivePowerUp(type: PowerUpType): void {
    if (type === 'pierce' || type === 'bounce') {
      this.player.applyPowerUp(type);
      this.callbacks.onPowerUpChange(type);
    } else {
      this.activePowerUp = { type, remaining: 8 };
      this.callbacks.onPowerUpChange(type);
    }
  }

  applyRunUpgrade(type: PowerUpType): void {
    this.player.applyPowerUp(type);
    if (type !== 'pierce' && type !== 'bounce') {
      this.setActivePowerUp(type);
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

  getDifficulty(): Difficulty {
    return this.difficulty;
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
