/**
 * ============================================
 * FORMATION MANAGER 3D - Formación de aliados
 * ============================================
 */

import * as THREE from 'three';
import { Ally3D } from '../entities/Ally3D';
import { Player3D } from '../entities/Player3D';
import { CONFIG } from '../types';

export class FormationManager {
  
  updateAllies(allies: Ally3D[], player: Player3D, scene: THREE.Group): Ally3D[] {
    const targetCount = player.stats.numAllies;
    const currentCount = allies.length;
    
    if (targetCount > currentCount) {
      for (let i = currentCount; i < targetCount; i++) {
        const pos = this.getFormationPosition(i, targetCount, player);
        const ally = new Ally3D(pos.x, pos.z, i);
        scene.add(ally.mesh);
        allies.push(ally);
      }
    } else if (targetCount < currentCount) {
      const removed = allies.splice(targetCount);
      for (const ally of removed) {
        ally.destroy(scene);
      }
    }
    
    this.updatePositions(allies, player);
    
    return allies;
  }
  
  updatePositions(allies: Ally3D[], player: Player3D): void {
    const count = allies.length;
    
    for (let i = 0; i < count; i++) {
      const pos = this.getFormationPosition(i, count, player);
      allies[i].setTargetPosition(pos.x, pos.z);
    }
  }
  
  private getFormationPosition(
    index: number,
    total: number,
    player: Player3D
  ): { x: number; z: number } {
    const playerX = player.x;
    const playerZ = player.z;
    
    const side = index % 2 === 0 ? -1 : 1;
    const row = Math.floor(index / 2);
    
    const offsetX = side * (row + 1) * CONFIG.ALLY_SPACING;
    const offsetZ = (row + 1) * CONFIG.ALLY_SPACING * 0.8;
    
    return {
      x: playerX + offsetX,
      z: playerZ + offsetZ
    };
  }
}

