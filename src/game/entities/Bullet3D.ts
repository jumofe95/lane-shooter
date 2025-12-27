/**
 * ============================================
 * BULLET3D - Proyectiles optimizados
 * ============================================
 */

import * as THREE from 'three';
import { Entity3D } from './Entity3D';
import { CONFIG } from '../types';
import { SharedMaterials } from '../SharedMaterials';

// Geometría compartida para todas las balas
const bulletGeometry = new THREE.SphereGeometry(CONFIG.BULLET_SIZE, 6, 4);

export class Bullet3D extends Entity3D {
  damage: number;
  piercing: number;
  piercedCount: number = 0;
  isPlayerBullet: boolean;
  speed: number;
  
  constructor(
    x: number,
    z: number,
    damage: number,
    piercing: number,
    isPlayerBullet: boolean
  ) {
    // Usar geometría y material compartidos
    const bullet = new THREE.Mesh(
      bulletGeometry,
      isPlayerBullet ? SharedMaterials.bulletPlayer : SharedMaterials.bulletEnemy
    );
    bullet.position.set(x, 0.5, z);
    
    super(bullet);
    
    this.damage = damage;
    this.piercing = piercing;
    this.isPlayerBullet = isPlayerBullet;
    this.speed = isPlayerBullet ? -CONFIG.BULLET_SPEED : CONFIG.BULLET_ENEMY_SPEED;
  }
  
  update(dt: number): void {
    this.z += this.speed * dt;
    
    if (this.isPlayerBullet && this.z < -CONFIG.GAME_DEPTH) {
      this.active = false;
    } else if (!this.isPlayerBullet && this.z > 20) {
      this.active = false;
    }
  }
  
  onHit(): boolean {
    this.piercedCount++;
    if (this.piercedCount >= this.piercing) {
      this.active = false;
      return false;
    }
    return true;
  }
  
  // Override destroy para no disponer geometría/material compartidos
  destroy(scene: THREE.Scene | THREE.Group): void {
    scene.remove(this.mesh);
    // No dispose geometry/material porque son compartidos
  }
}
