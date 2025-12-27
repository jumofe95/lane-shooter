/**
 * ============================================
 * BOSS PROJECTILE - Proyectiles de ataques especiales del boss
 * ============================================
 */

import * as THREE from 'three';
import { Entity3D } from './Entity3D';

export type ProjectileType = 'orb' | 'wave' | 'laser' | 'rain';

export class BossProjectile extends Entity3D {
  damage: number;
  speed: number;
  direction: THREE.Vector3;
  type: ProjectileType;
  lifetime: number = 0;
  maxLifetime: number = 5;
  
  private material: THREE.MeshBasicMaterial;
  
  constructor(
    x: number, 
    z: number, 
    damage: number, 
    type: ProjectileType,
    direction?: THREE.Vector3,
    speed?: number
  ) {
    let geometry: THREE.BufferGeometry;
    let color: number;
    
    switch (type) {
      case 'orb':
        geometry = new THREE.SphereGeometry(0.3, 8, 8);
        color = 0xff00ff;
        break;
      case 'wave':
        geometry = new THREE.RingGeometry(0.5, 0.7, 16);
        color = 0xff00aa;
        break;
      case 'rain':
        geometry = new THREE.ConeGeometry(0.15, 0.5, 6);
        color = 0xaa00ff;
        break;
      case 'laser':
        geometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
        color = 0xff0000;
        break;
      default:
        geometry = new THREE.SphereGeometry(0.3, 8, 8);
        color = 0xff00ff;
    }
    
    const material = new THREE.MeshBasicMaterial({ 
      color,
      transparent: true,
      opacity: 0.9
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, 1, z);
    
    if (type === 'rain') {
      mesh.rotation.x = Math.PI;
    } else if (type === 'wave') {
      mesh.rotation.x = -Math.PI / 2;
    }
    
    super(mesh);
    
    this.material = material;
    this.damage = damage;
    this.type = type;
    this.speed = speed ?? 8;
    this.direction = direction ?? new THREE.Vector3(0, 0, 1);
    this.direction.normalize();
  }
  
  update(dt: number): void {
    this.lifetime += dt;
    
    if (this.lifetime >= this.maxLifetime) {
      this.active = false;
      return;
    }
    
    // Movimiento según tipo
    switch (this.type) {
      case 'orb':
        this.x += this.direction.x * this.speed * dt;
        this.z += this.direction.z * this.speed * dt;
        this.mesh.rotation.y += dt * 5;
        this.mesh.rotation.x += dt * 3;
        break;
        
      case 'wave':
        // La onda se expande
        const scale = 1 + this.lifetime * 3;
        this.mesh.scale.set(scale, scale, 1);
        this.material.opacity = Math.max(0, 0.9 - this.lifetime * 0.3);
        this.z += this.speed * dt * 0.5;
        break;
        
      case 'rain':
        this.z += this.speed * dt;
        this.mesh.position.y -= dt * 2;
        if (this.mesh.position.y < 0.2) {
          this.active = false;
        }
        break;
        
      case 'laser':
        this.z += this.speed * dt;
        break;
    }
  }
  
  // Verificar colisión con el jugador
  checkPlayerCollision(playerX: number, playerZ: number, playerRadius: number = 0.5): boolean {
    if (!this.active) return false;
    
    const dx = this.x - playerX;
    const dz = this.z - playerZ;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    let hitRadius = 0.5;
    if (this.type === 'wave') {
      hitRadius = 1 + this.lifetime * 3;
    }
    
    return dist < (hitRadius + playerRadius);
  }
}

