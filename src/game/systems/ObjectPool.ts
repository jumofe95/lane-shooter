/**
 * ============================================
 * OBJECT POOL - Sistema de pooling para optimización de memoria
 * ============================================
 */

import * as THREE from 'three';
import { Enemy3D } from '../entities/Enemy3D';
import { Bullet3D } from '../entities/Bullet3D';

// Pool de enemigos
class EnemyPool {
  private pool: Enemy3D[] = [];
  private scene: THREE.Group | null = null;

  setScene(scene: THREE.Group): void {
    this.scene = scene;
  }

  get(x: number, z: number, health: number, speed?: number, value?: number): Enemy3D {
    // Buscar un enemigo inactivo en el pool
    for (const enemy of this.pool) {
      if (!enemy.active) {
        enemy.reset(x, z, health, speed, value);
        if (this.scene && !enemy.mesh.parent) {
          this.scene.add(enemy.mesh);
        }
        return enemy;
      }
    }

    // Si no hay disponibles, crear uno nuevo
    const enemy = new Enemy3D(x, z, health, speed, value);
    this.pool.push(enemy);
    if (this.scene) {
      this.scene.add(enemy.mesh);
    }
    return enemy;
  }

  release(enemy: Enemy3D): void {
    enemy.active = false;
    if (this.scene) {
      this.scene.remove(enemy.mesh);
    }
  }

  // Pre-calentar el pool
  prewarm(count: number): void {
    for (let i = 0; i < count; i++) {
      const enemy = new Enemy3D(0, -1000, 1);
      enemy.active = false;
      this.pool.push(enemy);
    }
  }

  clear(): void {
    for (const enemy of this.pool) {
      if (this.scene) {
        this.scene.remove(enemy.mesh);
      }
    }
    this.pool = [];
  }

  get size(): number {
    return this.pool.length;
  }

  get activeCount(): number {
    return this.pool.filter(e => e.active).length;
  }
}

// Pool de balas
class BulletPool {
  private pool: Bullet3D[] = [];
  private scene: THREE.Group | null = null;

  setScene(scene: THREE.Group): void {
    this.scene = scene;
  }

  get(x: number, z: number, damage: number, piercing: number, isPlayerBullet: boolean): Bullet3D {
    // Buscar una bala inactiva en el pool
    for (const bullet of this.pool) {
      if (!bullet.active && bullet.isPlayerBullet === isPlayerBullet) {
        bullet.reset(x, z, damage, piercing);
        if (this.scene && !bullet.mesh.parent) {
          this.scene.add(bullet.mesh);
        }
        return bullet;
      }
    }

    // Si no hay disponibles, crear una nueva
    const bullet = new Bullet3D(x, z, damage, piercing, isPlayerBullet);
    this.pool.push(bullet);
    if (this.scene) {
      this.scene.add(bullet.mesh);
    }
    return bullet;
  }

  release(bullet: Bullet3D): void {
    bullet.active = false;
    if (this.scene) {
      this.scene.remove(bullet.mesh);
    }
  }

  prewarm(count: number): void {
    // Pre-calentar con balas de jugador
    for (let i = 0; i < count; i++) {
      const bullet = new Bullet3D(0, -1000, 1, 1, true);
      bullet.active = false;
      this.pool.push(bullet);
    }
  }

  clear(): void {
    for (const bullet of this.pool) {
      if (this.scene) {
        this.scene.remove(bullet.mesh);
      }
    }
    this.pool = [];
  }
}

// Singleton pools
export const enemyPool = new EnemyPool();
export const bulletPool = new BulletPool();
