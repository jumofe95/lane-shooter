/**
 * ============================================
 * BOSS PROJECTILE - Proyectiles de ataques especiales del boss
 * ============================================
 */

import * as THREE from 'three';
import { Entity3D } from './Entity3D';

export type ProjectileType = 'orb' | 'wave' | 'laser' | 'rain' | 'barrier';

export class BossProjectile extends Entity3D {
  damage: number;
  speed: number;
  direction: THREE.Vector3;
  type: ProjectileType;
  lifetime: number = 0;
  maxLifetime: number = 5;
  
  // Para barreras con hueco
  gapX: number = 0;
  gapWidth: number = 2;
  barrierWidth: number = 12;
  
  private material: THREE.MeshBasicMaterial;
  
  constructor(
    x: number, 
    z: number, 
    damage: number, 
    type: ProjectileType,
    direction?: THREE.Vector3,
    speed?: number,
    gapX?: number,
    gapWidth?: number
  ) {
    let geometry: THREE.BufferGeometry;
    let color: number;
    let mesh: THREE.Object3D;
    
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
      case 'barrier':
        // Barrera con hueco - se crea como grupo
        break;
      default:
        geometry = new THREE.SphereGeometry(0.3, 8, 8);
        color = 0xff00ff;
    }
    
    const material = new THREE.MeshBasicMaterial({ 
      color: type === 'barrier' ? 0xff00ff : (color! as number),
      transparent: true,
      opacity: 0.9
    });
    
    if (type === 'barrier') {
      // Crear barrera con hueco
      console.log('🧱 Creando barrera con gapX=' + gapX + ', gapWidth=' + gapWidth);
      const group = new THREE.Group();
      const barrierWidth = 14;
      const gapW = gapWidth ?? 2.5;
      const gapPosition = gapX ?? 0;
      
      // Parte izquierda de la barrera
      const leftWidth = (barrierWidth / 2) + gapPosition - (gapW / 2);
      console.log('🧱 leftWidth=' + leftWidth);
      if (leftWidth > 0) {
        const leftBarrier = new THREE.Mesh(
          new THREE.BoxGeometry(leftWidth, 2, 0.5),
          material
        );
        leftBarrier.position.x = -barrierWidth / 2 + leftWidth / 2;
        group.add(leftBarrier);
        console.log('🧱 Añadida parte izquierda en x=' + leftBarrier.position.x);
      }
      
      // Parte derecha de la barrera
      const rightWidth = (barrierWidth / 2) - gapPosition - (gapW / 2);
      console.log('🧱 rightWidth=' + rightWidth);
      if (rightWidth > 0) {
        const rightBarrier = new THREE.Mesh(
          new THREE.BoxGeometry(rightWidth, 2, 0.5),
          material
        );
        rightBarrier.position.x = barrierWidth / 2 - rightWidth / 2;
        group.add(rightBarrier);
        console.log('🧱 Añadida parte derecha en x=' + rightBarrier.position.x);
      }
      
      group.position.set(x, 1, z);
      mesh = group;
      console.log('🧱 Barrera creada en posición: x=' + x + ', z=' + z + ', children=' + group.children.length);
    } else {
      mesh = new THREE.Mesh(geometry!, material);
      (mesh as THREE.Mesh).position.set(x, 1, z);
      
      if (type === 'rain') {
        mesh.rotation.x = Math.PI;
      } else if (type === 'wave') {
        mesh.rotation.x = -Math.PI / 2;
      }
    }
    
    super(mesh as THREE.Mesh);
    
    this.material = material;
    this.damage = damage;
    this.type = type;
    this.speed = speed ?? 8;
    this.direction = direction ?? new THREE.Vector3(0, 0, 1);
    this.direction.normalize();
    
    // Guardar datos del hueco para colisiones (debe ser después de super())
    if (type === 'barrier') {
      this.gapX = gapX ?? 0;
      this.gapWidth = gapWidth ?? 2.5;
      this.barrierWidth = 14;
    }
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
        
      case 'barrier':
        // La barrera avanza hacia el jugador
        this.z += this.speed * dt;
        // Desactivar cuando pase al jugador
        if (this.z > 5) {
          this.active = false;
        }
        break;
    }
  }
  
  // Verificar colisión con el jugador
  checkPlayerCollision(playerX: number, playerZ: number, playerRadius: number = 0.5): boolean {
    if (!this.active) return false;
    
    // Para barreras, verificar si está en el hueco
    if (this.type === 'barrier') {
      const dz = Math.abs(this.z - playerZ);
      
      // Solo colisiona si está cerca en Z
      if (dz > 1.5) return false;
      
      // Verificar si el jugador está en el hueco (no colisiona)
      const gapLeft = this.gapX - this.gapWidth / 2;
      const gapRight = this.gapX + this.gapWidth / 2;
      
      if (playerX > gapLeft + playerRadius && playerX < gapRight - playerRadius) {
        return false; // Está en el hueco, no hay colisión
      }
      
      // Verificar si está dentro del ancho de la barrera
      const halfWidth = this.barrierWidth / 2;
      if (playerX >= -halfWidth && playerX <= halfWidth) {
        return true; // Colisiona con la barrera
      }
      
      return false;
    }
    
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

