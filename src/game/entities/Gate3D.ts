/**
 * ============================================
 * GATE3D - Puertas con modificadores transparentes
 * ============================================
 */

import * as THREE from 'three';
import { Entity3D } from './Entity3D';
import { Modifier, ModifierType, CONFIG, COLORS } from '../types';

export class Gate3D extends Entity3D {
  modifier: Modifier;
  private originalZ: number;
  lane: number;
  
  constructor(modifier: Modifier, x: number, z: number, lane: number) {
    const group = new THREE.Group();
    
    const width = CONFIG.GATE_WIDTH;
    const height = CONFIG.GATE_HEIGHT;
    const depth = CONFIG.GATE_DEPTH;
    
    const color = modifier.isPositive ? 0x00ff66 : 0xff4444;
    
    // Marco con transparencia
    const frameMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    
    const frameThickness = 0.15;
    
    // Lados del marco
    const leftFrame = new THREE.Mesh(
      new THREE.BoxGeometry(frameThickness, height, depth),
      frameMaterial
    );
    leftFrame.position.set(-width / 2 + frameThickness / 2, height / 2, 0);
    group.add(leftFrame);
    
    const rightFrame = new THREE.Mesh(
      new THREE.BoxGeometry(frameThickness, height, depth),
      frameMaterial
    );
    rightFrame.position.set(width / 2 - frameThickness / 2, height / 2, 0);
    group.add(rightFrame);
    
    const topFrame = new THREE.Mesh(
      new THREE.BoxGeometry(width, frameThickness, depth),
      frameMaterial
    );
    topFrame.position.set(0, height - frameThickness / 2, 0);
    group.add(topFrame);
    
    // Panel central transparente con texto integrado
    const canvasWidth = 512;
    const canvasHeight = 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d')!;
    
    // Fondo semi-transparente
    const bgColor = modifier.isPositive ? 'rgba(0, 80, 40, 0.7)' : 'rgba(80, 20, 20, 0.7)';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Marco brillante
    const borderColor = modifier.isPositive ? '#00ff66' : '#ff4444';
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 12;
    ctx.strokeRect(10, 10, canvasWidth - 20, canvasHeight - 20);
    
    // Segundo marco interior
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, canvasWidth - 60, canvasHeight - 60);
    
    // Icono grande arriba
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = borderColor;
    ctx.fillText(modifier.isPositive ? '▲' : '▼', canvasWidth / 2, 140);
    
    // Fondo para el texto
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(40, canvasHeight / 2 - 50, canvasWidth - 80, 100);
    
    // Texto principal grande y claro
    ctx.font = 'bold 52px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = borderColor;
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillText(modifier.label, canvasWidth / 2, canvasHeight / 2);
    ctx.shadowBlur = 0;
    
    // Línea decorativa abajo
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, canvasHeight - 80);
    ctx.lineTo(canvasWidth - 60, canvasHeight - 80);
    ctx.stroke();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.flipY = true;
    
    const panelMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      side: THREE.FrontSide
    });
    
    // Panel frontal (mirando hacia el jugador)
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(width - frameThickness * 2, height - frameThickness),
      panelMaterial
    );
    panel.position.set(0, height / 2, depth / 2 + 0.01);
    group.add(panel);
    
    // Panel trasero con textura invertida
    const backTexture = new THREE.CanvasTexture(canvas);
    backTexture.needsUpdate = true;
    backTexture.flipY = true;
    
    const backPanelMaterial = new THREE.MeshBasicMaterial({
      map: backTexture,
      transparent: true,
      opacity: 1,
      side: THREE.FrontSide
    });
    
    const backPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(width - frameThickness * 2, height - frameThickness),
      backPanelMaterial
    );
    backPanel.position.set(0, height / 2, -depth / 2 - 0.01);
    backPanel.rotation.y = Math.PI;
    group.add(backPanel);
    
    // Efecto glow
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    const glowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(width + 1, height + 1),
      glowMaterial
    );
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
    
    // Generar 2 puertas (una positiva, una negativa) para los 2 carriles
    const modifierTypes: { type: ModifierType; isPositive: boolean }[] = [
      { type: 'add_allies', isPositive: true },
      { type: 'fire_rate', isPositive: true },
      { type: 'damage', isPositive: true },
      { type: 'piercing', isPositive: true },
      { type: 'remove_allies', isPositive: false },
      { type: 'fire_rate', isPositive: false },
      { type: 'damage', isPositive: false },
    ];
    
    // Seleccionar una positiva y una negativa
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
}

