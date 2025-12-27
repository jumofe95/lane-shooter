/**
 * ============================================
 * GATE3D - Puertas con modificadores optimizadas
 * ============================================
 */

import * as THREE from 'three';
import { Entity3D } from './Entity3D';
import { Modifier, ModifierType, CONFIG } from '../types';
import { SharedGeometries, getGateTexture } from '../SharedMaterials';

export class Gate3D extends Entity3D {
  modifier: Modifier;
  private originalZ: number;
  lane: number;

  constructor(modifier: Modifier, x: number, z: number, lane: number) {
    const group = new THREE.Group();
    const geom = SharedGeometries.gate;

    const width = CONFIG.GATE_WIDTH;
    const height = CONFIG.GATE_HEIGHT;
    const depth = CONFIG.GATE_DEPTH;

    const color = modifier.isPositive ? 0x00ff66 : 0xff4444;

    // Marco con transparencia - material por instancia (barato)
    const frameMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });

    const frameThickness = 0.15;

    // Lados del marco - geometrías compartidas
    const leftFrame = new THREE.Mesh(geom.frameVertical, frameMaterial);
    leftFrame.position.set(-width / 2 + frameThickness / 2, height / 2, 0);
    group.add(leftFrame);

    const rightFrame = new THREE.Mesh(geom.frameVertical, frameMaterial);
    rightFrame.position.set(width / 2 - frameThickness / 2, height / 2, 0);
    group.add(rightFrame);

    const topFrame = new THREE.Mesh(geom.frameHorizontal, frameMaterial);
    topFrame.position.set(0, height - frameThickness / 2, 0);
    group.add(topFrame);

    // Textura cacheada - GRAN OPTIMIZACIÓN
    const texture = getGateTexture(modifier.label, modifier.isPositive);

    const panelMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      side: THREE.FrontSide
    });

    // Panel frontal - geometría compartida
    const panel = new THREE.Mesh(geom.panel, panelMaterial);
    panel.position.set(0, height / 2, depth / 2 + 0.01);
    group.add(panel);

    // Panel trasero - reusar la misma textura
    const backPanelMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      side: THREE.FrontSide
    });

    const backPanel = new THREE.Mesh(geom.panel, backPanelMaterial);
    backPanel.position.set(0, height / 2, -depth / 2 - 0.01);
    backPanel.rotation.y = Math.PI;
    group.add(backPanel);

    // Efecto glow - geometría compartida
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });

    const glowPlane = new THREE.Mesh(geom.glow, glowMaterial);
    glowPlane.position.set(0, height / 2, 0);
    group.add(glowPlane);

    group.position.set(x, 0, z);

    super(group);

    this.modifier = modifier;
    this.originalZ = z;
    this.lane = lane;
  }

  update(dt: number): void {
    this.z += CONFIG.GATE_SPEED * dt;

    if (this.z > 15) {
      this.active = false;
    }
  }

  static generateGateSet(scene: THREE.Group): Gate3D[] {
    const gates: Gate3D[] = [];

    const modifierTypes: { type: ModifierType; isPositive: boolean }[] = [
      { type: 'add_allies', isPositive: true },
      { type: 'fire_rate', isPositive: true },
      { type: 'damage', isPositive: true },
      { type: 'piercing', isPositive: true },
      { type: 'remove_allies', isPositive: false },
      { type: 'fire_rate', isPositive: false },
      { type: 'damage', isPositive: false },
    ];

    const positives = modifierTypes.filter(m => m.isPositive);
    const negatives = modifierTypes.filter(m => !m.isPositive);

    const selectedPositive = positives[Math.floor(Math.random() * positives.length)];
    const selectedNegative = negatives[Math.floor(Math.random() * negatives.length)];

    const selections = Math.random() < 0.5
      ? [selectedPositive, selectedNegative]
      : [selectedNegative, selectedPositive];

    for (let lane = 0; lane < CONFIG.NUM_LANES; lane++) {
      const selection = selections[lane];
      const modifier = Gate3D.createModifier(selection.type, selection.isPositive);

      const laneCenter = -CONFIG.GAME_WIDTH / 2 + CONFIG.LANE_WIDTH * (lane + 0.5);

      const gate = new Gate3D(modifier, laneCenter, CONFIG.GATE_SPAWN_Z, lane);
      scene.add(gate.mesh);
      gates.push(gate);
    }

    return gates;
  }

  private static createModifier(type: ModifierType, isPositive: boolean): Modifier {
    let value: number;
    let label: string;

    switch (type) {
      case 'add_allies':
        value = Math.floor(Math.random() * 2) + 1;
        label = `+${value} Aliados`;
        break;
      case 'remove_allies':
        value = 1;
        label = `-${value} Aliado`;
        break;
      case 'multiply_allies':
        if (isPositive) {
          value = 2;
          label = `x${value} Aliados`;
        } else {
          value = 0.5;
          label = `÷2 Aliados`;
        }
        break;
      case 'fire_rate':
        if (isPositive) {
          value = 0.5 + Math.random() * 0.5;
          label = `+${value.toFixed(1)} Cadencia`;
        } else {
          value = -(0.2 + Math.random() * 0.2);
          label = `${value.toFixed(1)} Cadencia`;
        }
        break;
      case 'damage':
        if (isPositive) {
          value = 3 + Math.floor(Math.random() * 3);
          label = `+${value} Daño`;
        } else {
          value = -(1 + Math.floor(Math.random() * 2));
          label = `${value} Daño`;
        }
        break;
      case 'piercing':
        if (isPositive) {
          value = 1;
          label = `+${value} Piercing`;
        } else {
          value = -1;
          label = `${value} Piercing`;
        }
        break;
      default:
        value = 0;
        label = '???';
    }

    return { type, value, label, isPositive };
  }

  // Override destroy para no dispose geometrías/texturas compartidas
  destroy(scene: THREE.Scene | THREE.Group): void {
    scene.remove(this.mesh);
    // NO hacer dispose de geometrías/texturas porque son compartidas
  }
}
