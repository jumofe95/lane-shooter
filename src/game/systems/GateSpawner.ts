/**
 * ============================================
 * GATE SPAWNER 3D - Sistema de puertas
 * ============================================
 */

import * as THREE from 'three';
import { Gate3D } from '../entities/Gate3D';
import { CONFIG } from '../types';

export class GateSpawner {
  private spawnTimer: number = 0;
  private nextSpawnTime: number;
  
  constructor() {
    this.nextSpawnTime = this.getRandomSpawnTime();
  }
  
  update(dt: number, hasActiveGates: boolean, scene: THREE.Group): Gate3D[] {
    if (hasActiveGates) return [];
    
    this.spawnTimer += dt;
    
    if (this.spawnTimer >= this.nextSpawnTime) {
      this.spawnTimer = 0;
      this.nextSpawnTime = this.getRandomSpawnTime();
      return Gate3D.generateGateSet(scene);
    }
    
    return [];
  }
  
  private getRandomSpawnTime(): number {
    return CONFIG.GATE_SPAWN_MIN + 
      Math.random() * (CONFIG.GATE_SPAWN_MAX - CONFIG.GATE_SPAWN_MIN);
  }
  
  reset(): void {
    this.spawnTimer = 0;
    this.nextSpawnTime = this.getRandomSpawnTime();
  }
}

