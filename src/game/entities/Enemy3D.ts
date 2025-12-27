/**
 * ============================================
 * ENEMY3D - Enemigo Stickman estilo clásico con barra de vida
 * ============================================
 */

import * as THREE from 'three';
import { Entity3D } from './Entity3D';
import { CONFIG } from '../types';
import { GameScene } from '../Scene';

// Segmentos reducidos para móviles
const SEGMENTS = GameScene.isMobile ? 4 : 6;
const TORUS_SEGMENTS = GameScene.isMobile ? 12 : 20;

export class Enemy3D extends Entity3D {
  health: number;
  maxHealth: number;
  speed: number;
  value: number = 10;
  
  private head: THREE.Group;
  private bodyLine: THREE.Mesh;
  private leftArmPivot: THREE.Group;
  private leftArmJoint: THREE.Group;
  private rightArmPivot: THREE.Group;
  private rightArmJoint: THREE.Group;
  private leftLegPivot: THREE.Group;
  private leftLegJoint: THREE.Group;
  private rightLegPivot: THREE.Group;
  private rightLegJoint: THREE.Group;
  
  private healthBarFill: THREE.Mesh;
  private healthBarBg: THREE.Mesh;
  
  private lineMaterial: THREE.MeshBasicMaterial;
  private animationPhase: number;
  
  constructor(x: number, z: number, health: number, speed?: number, value?: number) {
    const group = new THREE.Group();
    
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lineThickness = 0.1;
    
    const scale = CONFIG.ENEMY_SIZE * 1.1;
    
    // Guardar valores para después del super()
    const enemySpeed = speed ?? CONFIG.ENEMY_SPEED_BASE;
    const enemyValue = value ?? 10;
    
    // CABEZA
    const headGroup = new THREE.Group();
    headGroup.position.y = scale * 2.2;
    
    const headRing = new THREE.Mesh(
      new THREE.TorusGeometry(scale * 0.32, lineThickness, 6, TORUS_SEGMENTS),
      lineMaterial
    );
    headRing.rotation.x = Math.PI / 2;
    headGroup.add(headRing);
    
    const headFill = new THREE.Mesh(
      new THREE.CircleGeometry(scale * 0.31, TORUS_SEGMENTS),
      new THREE.MeshBasicMaterial({ color: 0x222222 })
    );
    headFill.position.z = 0.01;
    headGroup.add(headFill);
    
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const leftEye = new THREE.Mesh(new THREE.CircleGeometry(scale * 0.06, 6), eyeMaterial);
    leftEye.position.set(-scale * 0.1, scale * 0.05, 0.02);
    headGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(new THREE.CircleGeometry(scale * 0.06, 6), eyeMaterial);
    rightEye.position.set(scale * 0.1, scale * 0.05, 0.02);
    headGroup.add(rightEye);
    
    const frownGeometry = new THREE.BufferGeometry();
    const frownPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 10; i++) {
      const angle = -(Math.PI * 0.25) - (i / 10) * (Math.PI * 0.5);
      frownPoints.push(new THREE.Vector3(
        Math.cos(angle) * scale * 0.15,
        -Math.sin(angle) * scale * 0.1 - scale * 0.12,
        0.02
      ));
    }
    frownGeometry.setFromPoints(frownPoints);
    const frown = new THREE.Line(frownGeometry, new THREE.LineBasicMaterial({ color: 0xff0000 }));
    headGroup.add(frown);
    
    group.add(headGroup);
    
    // CUERPO
    const bodyLine = new THREE.Mesh(
      new THREE.CylinderGeometry(lineThickness, lineThickness, scale * 1.0, SEGMENTS),
      lineMaterial
    );
    bodyLine.position.y = scale * 1.5;
    group.add(bodyLine);
    
    // BRAZOS
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-lineThickness, scale * 1.95, 0);
    
    const leftUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(lineThickness, lineThickness, scale * 0.45, 6),
      lineMaterial
    );
    leftUpperArm.position.y = -scale * 0.22;
    leftArmPivot.add(leftUpperArm);
    
    const leftArmJoint = new THREE.Group();
    leftArmJoint.position.y = -scale * 0.45;
    
    const leftLowerArm = new THREE.Mesh(
      new THREE.CylinderGeometry(lineThickness, lineThickness, scale * 0.4, 6),
      lineMaterial
    );
    leftLowerArm.position.y = -scale * 0.2;
    leftArmJoint.add(leftLowerArm);
    
    leftArmPivot.add(leftArmJoint);
    group.add(leftArmPivot);
    
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(lineThickness, scale * 1.95, 0);
    
    const rightUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(lineThickness, lineThickness, scale * 0.45, 6),
      lineMaterial
    );
    rightUpperArm.position.y = -scale * 0.22;
    rightArmPivot.add(rightUpperArm);
    
    const rightArmJoint = new THREE.Group();
    rightArmJoint.position.y = -scale * 0.45;
    
    const rightLowerArm = new THREE.Mesh(
      new THREE.CylinderGeometry(lineThickness, lineThickness, scale * 0.4, 6),
      lineMaterial
    );
    rightLowerArm.position.y = -scale * 0.2;
    rightArmJoint.add(rightLowerArm);
    
    rightArmPivot.add(rightArmJoint);
    group.add(rightArmPivot);
    
    // PIERNAS
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-scale * 0.1, scale * 0.95, 0);
    
    const leftUpperLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(lineThickness, lineThickness, scale * 0.5, 6),
      lineMaterial
    );
    leftUpperLeg.position.y = -scale * 0.25;
    leftLegPivot.add(leftUpperLeg);
    
    const leftLegJoint = new THREE.Group();
    leftLegJoint.position.y = -scale * 0.5;
    
    const leftLowerLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(lineThickness, lineThickness, scale * 0.5, 6),
      lineMaterial
    );
    leftLowerLeg.position.y = -scale * 0.25;
    leftLegJoint.add(leftLowerLeg);
    
    leftLegPivot.add(leftLegJoint);
    group.add(leftLegPivot);
    
    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(scale * 0.1, scale * 0.95, 0);
    
    const rightUpperLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(lineThickness, lineThickness, scale * 0.5, 6),
      lineMaterial
    );
    rightUpperLeg.position.y = -scale * 0.25;
    rightLegPivot.add(rightUpperLeg);
    
    const rightLegJoint = new THREE.Group();
    rightLegJoint.position.y = -scale * 0.5;
    
    const rightLowerLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(lineThickness, lineThickness, scale * 0.5, 6),
      lineMaterial
    );
    rightLowerLeg.position.y = -scale * 0.25;
    rightLegJoint.add(rightLowerLeg);
    
    rightLegPivot.add(rightLegJoint);
    group.add(rightLegPivot);
    
    group.position.set(x, 0, z);
    group.rotation.y = Math.PI;
    
    // BARRA DE VIDA - Separada del grupo rotado para que siempre mire al jugador
    const barWidth = scale * 0.8;
    const barHeight = 0.2;
    
    // Grupo de la barra de vida (no rotado)
    const healthBarGroup = new THREE.Group();
    healthBarGroup.position.set(0, scale * 2.8, 0);
    // Contra-rotar para que mire hacia la cámara
    healthBarGroup.rotation.y = -Math.PI;
    group.add(healthBarGroup);
    
    const healthBarBg = new THREE.Mesh(
      new THREE.PlaneGeometry(barWidth, barHeight),
      new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.DoubleSide })
    );
    healthBarGroup.add(healthBarBg);
    
    const healthBarFill = new THREE.Mesh(
      new THREE.PlaneGeometry(barWidth * 0.95, barHeight * 0.7),
      new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide })
    );
    healthBarFill.position.z = 0.01;
    healthBarGroup.add(healthBarFill);
    
    super(group);
    
    this.head = headGroup;
    this.bodyLine = bodyLine;
    this.leftArmPivot = leftArmPivot;
    this.leftArmJoint = leftArmJoint;
    this.rightArmPivot = rightArmPivot;
    this.rightArmJoint = rightArmJoint;
    this.leftLegPivot = leftLegPivot;
    this.leftLegJoint = leftLegJoint;
    this.rightLegPivot = rightLegPivot;
    this.rightLegJoint = rightLegJoint;
    this.lineMaterial = lineMaterial;
    this.healthBarFill = healthBarFill;
    this.healthBarBg = healthBarBg;
    
    this.health = health;
    this.maxHealth = health;
    this.speed = enemySpeed + Math.random() * 2;
    this.value = enemyValue;
    this.animationPhase = Math.random() * Math.PI * 2;
  }
  
  update(dt: number): void {
    this.z += this.speed * dt;
    
    this.animationPhase += dt * 12;
    const phase = this.animationPhase;
    
    const leftLegAngle = Math.sin(phase) * 0.7;
    const rightLegAngle = Math.sin(phase + Math.PI) * 0.7;
    
    this.leftLegPivot.rotation.x = leftLegAngle;
    this.rightLegPivot.rotation.x = rightLegAngle;
    
    this.leftLegJoint.rotation.x = Math.max(0, -leftLegAngle) * 0.9 + 0.15;
    this.rightLegJoint.rotation.x = Math.max(0, -rightLegAngle) * 0.9 + 0.15;
    
    const leftArmAngle = Math.sin(phase + Math.PI) * 0.6;
    const rightArmAngle = Math.sin(phase) * 0.6;
    
    this.leftArmPivot.rotation.x = leftArmAngle;
    this.rightArmPivot.rotation.x = rightArmAngle;
    
    this.leftArmJoint.rotation.x = -Math.max(0, Math.sin(phase + Math.PI)) * 0.5 - 0.2;
    this.rightArmJoint.rotation.x = -Math.max(0, Math.sin(phase)) * 0.5 - 0.2;
    
    this.mesh.position.y = Math.abs(Math.sin(phase * 2)) * 0.15;
    this.bodyLine.rotation.z = Math.sin(phase) * 0.08;
    
    if (this.z > 10) {
      this.active = false;
    }
  }
  
  updateHealthBar(): void {
    const healthPercent = Math.max(0.01, this.health / this.maxHealth);
    const scale = CONFIG.ENEMY_SIZE * 1.1;
    const barWidth = scale * 0.8 * 0.95;
    
    // Escalar y reposicionar la barra
    this.healthBarFill.scale.x = healthPercent;
    this.healthBarFill.position.x = barWidth * (1 - healthPercent) / 2;
    
    // Color: verde (100%) -> amarillo (50%) -> rojo (0%)
    let r, g;
    if (healthPercent > 0.5) {
      r = (1 - healthPercent) * 2;
      g = 1;
    } else {
      r = 1;
      g = healthPercent * 2;
    }
    (this.healthBarFill.material as THREE.MeshBasicMaterial).color.setRGB(r, g, 0);
  }
  
  takeDamage(amount: number): boolean {
    this.health -= amount;
    this.updateHealthBar();
    
    this.lineMaterial.color.setHex(0xff0000);
    setTimeout(() => {
      this.lineMaterial.color.setHex(0xffffff);
    }, 80);
    
    if (this.health <= 0) {
      this.active = false;
      return true;
    }
    return false;
  }
  
  get reachedEnd(): boolean {
    return this.z > 8;
  }
}

