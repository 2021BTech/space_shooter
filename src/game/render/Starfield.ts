import * as THREE from 'three';

interface StarLayer {
  points: THREE.Points;
  speeds: Float32Array;
  bounds: { left: number; right: number; top: number; bottom: number };
}

export class Starfield {
  private layers: StarLayer[] = [];
  private group = new THREE.Group();

  constructor(scene: THREE.Scene, width: number, height: number) {
    const layerConfigs = [
      { count: 120, size: 0.04, color: 0x888888, speed: 0.2 },
      { count: 60, size: 0.08, color: 0xbbbbbb, speed: 0.5 },
      { count: 25, size: 0.15, color: 0xffffff, speed: 1.0 },
    ];

    for (const cfg of layerConfigs) {
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
      });
    }

    scene.add(this.group);
  }

  update(dt: number): void {
    for (const layer of this.layers) {
      const positions = layer.points.geometry.attributes.position.array as Float32Array;
      const count = positions.length / 3;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3 + 1] -= layer.speeds[i] * dt;
        if (positions[i3 + 1] < layer.bounds.bottom) {
          positions[i3 + 1] = layer.bounds.top;
          positions[i3] = (Math.random() - 0.5) * (layer.bounds.right - layer.bounds.left);
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
