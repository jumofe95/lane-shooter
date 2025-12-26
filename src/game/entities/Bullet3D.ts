/**
 * ============================================
 * BULLET3D - Proyectiles en 3D
 * ============================================
 */

import * as THREE from 'three';
import { Entity3D } from './Entity3D';
import { CONFIG, COLORS } from '../types';

export class Bullet3D extends Entity3D {
  damage: number;
  piercing: number;
  piercedCount: number = 0;
  isPlayerBullet: boolean;
  speed: number;
  
  private trail: THREE.Mesh;
  
  constructor(
    x: number,
    z: number,
    damage: number,
    piercing: number,
    isPlayerBullet: boolean
  ) {
    const group = new THREE.Group();
    
    const bulletGeometry = new THREE.SphereGeometry(CONFIG.BULLET_SIZE, 8, 8);
    const bulletMaterial = new THREE.MeshBasicMaterial({
      color: isPlayerBullet ? COLORS.bullet : COLORS.enemyBullet,
    });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    group.add(bullet);
    
    const trailGeometry = new THREE.CylinderGeometry(
      CONFIG.BULLET_SIZE * 0.3,
      CONFIG.BULLET_SIZE * 0.1,
      CONFIG.BULLET_SIZE * 3,
      6
    );
    const trailMaterial = new THREE.MeshBasicMaterial({
      color: isPlayerBullet ? COLORS.bullet : COLORS.enemyBullet,
      transparent: true,
      opacity: 0.5
    });
    const trail = new THREE.Mesh(trailGeometry, trailMaterial);
    trail.rotation.x = isPlayerBullet ? -Math.PI / 2 : Math.PI / 2;
    trail.position.z = isPlayerBullet ? CONFIG.BULLET_SIZE * 1.5 : -CONFIG.BULLET_SIZE * 1.5;
    group.add(trail);
    
    group.position.set(x, 0.5, z);
    
    super(group);
    
    this.trail = trail;
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
}

