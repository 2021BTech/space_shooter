import * as THREE from 'three';

const LAYER_CONFIGS = [
  { count: 120, size: 0.04, color: 0x888888, speed: 0.2 },
  { count: 60, size: 0.08, color: 0xbbbbbb, speed: 0.5 },
  { count: 25, size: 0.15, color: 0xffffff, speed: 1.0 },
];

interface StarLayer {
  points: THREE.Points;
  speeds: Float32Array;
  bounds: { left: number; right: number; top: number; bottom: number };
  basePositions: Float32Array;
  currentOffset: THREE.Vector2;
  targetOffset: THREE.Vector2;
}

export class Starfield {
  private layers: StarLayer[] = [];
  private group = new THREE.Group();

  constructor(scene: THREE.Scene, width: number, height: number) {
    for (let li = 0; li < LAYER_CONFIGS.length; li++) {
      const cfg = LAYER_CONFIGS[li];
      const positions = new Float32Array(cfg.count * 3);
      const speeds = new Float32Array(cfg.count);
      const colors = new Float32Array(cfg.count * 3);

      for (let i = 0; i < cfg.count; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * width * 2;
        positions[i3 + 1] = (Math.random() - 0.5) * height * 2;
        positions[i3 + 2] = -2;
        speeds[i] = cfg.speed * (0.5 + Math.random());

        const c = new THREE.Color(cfg.color);
        const brightness = 0.5 + Math.random() * 0.5;
        colors[i3] = c.r * brightness;
        colors[i3 + 1] = c.g * brightness;
        colors[i3 + 2] = c.b * brightness;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: cfg.size,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: false,
      });

      const points = new THREE.Points(geometry, material);
      this.group.add(points);

      this.layers.push({
        points,
        speeds,
        bounds: { left: -width, right: width, top: height, bottom: -height },
        basePositions: new Float32Array(positions),
        currentOffset: new THREE.Vector2(),
        targetOffset: new THREE.Vector2(),
      });
    }

    scene.add(this.group);
  }

  update(dt: number, playerOffsetX = 0, playerOffsetY = 0): void {
    for (let li = 0; li < this.layers.length; li++) {
      const layer = this.layers[li];
      const parallaxFactor = [0.15, 0.4, 0.8][li];
      layer.targetOffset.set(
        -playerOffsetX * parallaxFactor,
        -playerOffsetY * parallaxFactor * 0.3
      );
      layer.currentOffset.lerp(layer.targetOffset, 4 * dt);

      const positions = layer.points.geometry.attributes.position.array as Float32Array;
      const count = positions.length / 3;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3] = layer.basePositions[i3] + layer.currentOffset.x;
        positions[i3 + 1] = layer.basePositions[i3 + 1] + layer.currentOffset.y - layer.speeds[i] * dt;

        if (positions[i3 + 1] < layer.bounds.bottom) {
          positions[i3 + 1] = layer.bounds.top;
          const idx = Math.floor(Math.random() * count);
          positions[i3] = layer.basePositions[idx * 3];
          layer.basePositions[i3] = positions[i3];
          layer.basePositions[i3 + 1] = positions[i3 + 1];
        }
        if (positions[i3] < layer.bounds.left) {
          positions[i3] = layer.bounds.right;
          layer.basePositions[i3] = positions[i3];
        } else if (positions[i3] > layer.bounds.right) {
          positions[i3] = layer.bounds.left;
          layer.basePositions[i3] = positions[i3];
        }
      }
      layer.points.geometry.attributes.position.needsUpdate = true;
    }
  }

  resize(width: number, height: number): void {
    for (const layer of this.layers) {
      layer.bounds = { left: -width, right: width, top: height, bottom: -height };
      const positions = layer.points.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length / 3; i++) {
        const i3 = i * 3;
        if (Math.abs(positions[i3]) > width) {
          positions[i3] = (Math.random() - 0.5) * width * 2;
        }
        if (Math.abs(positions[i3 + 1]) > height) {
          positions[i3 + 1] = (Math.random() - 0.5) * height * 2;
        }
        layer.basePositions[i3] = positions[i3];
        layer.basePositions[i3 + 1] = positions[i3 + 1];
      }
      layer.points.geometry.attributes.position.needsUpdate = true;
    }
  }

  destroy(): void {
    for (const layer of this.layers) {
      layer.points.geometry.dispose();
      (layer.points.material as THREE.PointsMaterial).dispose();
    }
    this.group.clear();
  }
}
