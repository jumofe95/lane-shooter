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
    const spacing = CONFIG.ALLY_SPACING;
    
    // Formación en grupo compacto alrededor del jugador
    // Primera fila: a los lados del jugador
    // Segunda fila: detrás
    // Tercera fila+: más atrás en filas
    
    const positions = [
      // Fila 1: a los lados (índices 0, 1)
      { x: -spacing, z: 0.3 },
      { x: spacing, z: 0.3 },
      // Fila 2: detrás en diagonal (índices 2, 3)
      { x: -spacing * 0.6, z: spacing * 0.8 },
      { x: spacing * 0.6, z: spacing * 0.8 },
      // Fila 3: más atrás (índices 4, 5, 6)
      { x: 0, z: spacing * 1.2 },
      { x: -spacing * 1.1, z: spacing * 1.2 },
      { x: spacing * 1.1, z: spacing * 1.2 },
      // Fila 4: aún más atrás (índices 7, 8, 9, 10)
      { x: -spacing * 0.5, z: spacing * 1.7 },
      { x: spacing * 0.5, z: spacing * 1.7 },
      { x: -spacing * 1.3, z: spacing * 1.7 },
      { x: spacing * 1.3, z: spacing * 1.7 },
    ];
    
    // Si hay más aliados que posiciones predefinidas, generar más filas
    if (index < positions.length) {
      return {
        x: playerX + positions[index].x,
        z: playerZ + positions[index].z
      };
    }
    
    // Para aliados extra, crear filas adicionales
    const extraIndex = index - positions.length;
    const row = Math.floor(extraIndex / 4);
    const col = extraIndex % 4;
    const colOffsets = [-spacing * 1.2, -spacing * 0.4, spacing * 0.4, spacing * 1.2];
    
    return {
      x: playerX + colOffsets[col],
      z: playerZ + spacing * (2.2 + row * 0.6)
    };
  }
}

