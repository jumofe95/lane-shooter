/**
 * ============================================
 * WAVE SPAWNER 3D - Sistema de oleadas con niveles
 * ============================================
 */

import * as THREE from 'three';
import { Enemy3D } from '../entities/Enemy3D';
import { CONFIG, getLevelConfig } from '../types';

export class WaveSpawner {
  private waveTimer: number = 0;
  private currentWave: number = 0;
  private paused: boolean = false;
  private currentLevel: number = 1;
  
  setLevel(level: number): void {
    this.currentLevel = level;
  }
  
  update(dt: number, scene: THREE.Group): Enemy3D[] {
    if (this.paused) return [];
    
    const levelConfig = getLevelConfig(this.currentLevel);
    
    this.waveTimer += dt;
    
    if (this.waveTimer >= levelConfig.waveInterval) {
      this.waveTimer = 0;
      return this.spawnWave(scene);
    }
    
    return [];
  }
  
  private spawnWave(scene: THREE.Group): Enemy3D[] {
    const enemies: Enemy3D[] = [];
    this.currentWave++;
    
    const levelConfig = getLevelConfig(this.currentLevel);
    
    // Más enemigos según el nivel y la oleada actual
    const baseCount = levelConfig.enemiesPerWave;
    const waveBonus = Math.floor(this.currentWave / 2);
    const enemyCount = baseCount + waveBonus;
    
    const positions = this.generateSpawnPositions(enemyCount);
    
    for (let i = 0; i < enemyCount; i++) {
      const zOffset = (i % 3) * 3;
      
      // Vida aumenta según el nivel y ligeramente por oleada
      const health = levelConfig.enemyHealth + (this.currentWave - 1) * 3;
      
      const enemy = new Enemy3D(
        positions[i],
        CONFIG.ENEMY_SPAWN_Z - zOffset,
        health,
        levelConfig.enemySpeed,
        levelConfig.enemyValue
      );
      
      scene.add(enemy.mesh);
      enemies.push(enemy);
    }
    
    console.log(`🌊 Nivel ${this.currentLevel} - Oleada ${this.currentWave}: ${enemyCount} enemigos`);
    
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
  
  resume(): void {
    this.paused = false;
  }
  
  reset(): void {
    this.waveTimer = 0;
    this.currentWave = 0;
    this.paused = false;
  }
  
  resetForNewLevel(): void {
    this.waveTimer = 0;
    this.currentWave = 0;
    this.paused = false;
  }
}
