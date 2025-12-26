/**
 * ============================================
 * WAVE SPAWNER 3D - Sistema de oleadas
 * ============================================
 */

import * as THREE from 'three';
import { Enemy3D } from '../entities/Enemy3D';
import { CONFIG } from '../types';

export class WaveSpawner {
  private waveTimer: number = 0;
  private currentWave: number = 0;
  private paused: boolean = false;
  
  update(dt: number, scene: THREE.Group): Enemy3D[] {
    if (this.paused) return [];
    
    this.waveTimer += dt;
    
    if (this.waveTimer >= CONFIG.WAVE_SPAWN_INTERVAL) {
      this.waveTimer = 0;
      return this.spawnWave(scene);
    }
    
    return [];
  }
  
  private spawnWave(scene: THREE.Group): Enemy3D[] {
    const enemies: Enemy3D[] = [];
    this.currentWave++;
    
    const enemyCount = CONFIG.WAVE_ENEMY_COUNT_BASE + 
      Math.floor((this.currentWave - 1) / 2) * CONFIG.WAVE_ENEMY_INCREMENT;
    
    const positions = this.generateSpawnPositions(enemyCount);
    
    for (let i = 0; i < enemyCount; i++) {
      const zOffset = (i % 3) * 3;
      const health = CONFIG.ENEMY_HEALTH + (this.currentWave - 1) * 5;
      
      const enemy = new Enemy3D(
        positions[i],
        CONFIG.ENEMY_SPAWN_Z - zOffset,
        health
      );
      
      scene.add(enemy.mesh);
      enemies.push(enemy);
    }
    
    console.log(`🌊 Oleada ${this.currentWave}: ${enemyCount} enemigos`);
    
    return enemies;
  }
  
  private generateSpawnPositions(count: number): number[] {
    const positions: number[] = [];
    const halfWidth = CONFIG.GAME_WIDTH / 2 - CONFIG.ENEMY_SIZE;
    const sectionWidth = (halfWidth * 2) / count;
    
    for (let i = 0; i < count; i++) {
      const baseX = -halfWidth + sectionWidth * i + sectionWidth / 2;
      const variation = (Math.random() - 0.5) * sectionWidth * 0.6;
      positions.push(baseX + variation);
    }
    
    return positions;
  }
  
  get wave(): number {
    return this.currentWave;
  }
  
  get isBossTime(): boolean {
    return this.currentWave >= CONFIG.WAVES_BEFORE_BOSS;
  }
  
  pause(): void {
    this.paused = true;
  }
  
  reset(): void {
    this.waveTimer = 0;
    this.currentWave = 0;
    this.paused = false;
  }
}

