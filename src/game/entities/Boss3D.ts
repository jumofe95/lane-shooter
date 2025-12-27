/**
 * ============================================
 * BOSS3D - Jefe Stickman gigante con barra de vida
 * ============================================
 */

import * as THREE from 'three';
import { Entity3D } from './Entity3D';
import { CONFIG, COLORS } from '../types';

export class Boss3D extends Entity3D {
  health: number;
  maxHealth: number;
  value: number = 100;
  private bossSpeed: number;
  
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
  
  private lineMaterial: THREE.MeshBasicMaterial;
  private animationPhase: number = 0;
  rings: THREE.Mesh[] = [];
  
  constructor(health?: number, speed?: number, value?: number) {
    const group = new THREE.Group();
    
    super(group);
    
    // Guardar valores de configuración
    const bossHealth = health ?? CONFIG.BOSS_HEALTH_BASE;
    const bossSpeedVal = speed ?? CONFIG.BOSS_SPEED_BASE;
    const bossValue = value ?? 100;
    
    this.bossSpeed = bossSpeedVal;
    
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const lineThickness = 0.2;
    
    const scale = CONFIG.BOSS_SIZE;
    
    // CABEZA
    const headGroup = new THREE.Group();
    headGroup.position.y = scale * 2.2;
    
    const headRing = new THREE.Mesh(
      new THREE.TorusGeometry(scale * 0.35, lineThickness, 8, 24),
      lineMaterial
    );
    headRing.rotation.x = Math.PI / 2;
    headGroup.add(headRing);
    
    const headFill = new THREE.Mesh(
      new THREE.CircleGeometry(scale * 0.34, 24),
      new THREE.MeshBasicMaterial({ color: 0x220022 })
    );
    headFill.position.z = 0.01;
    headGroup.add(headFill);
    
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const leftEye = new THREE.Mesh(new THREE.CircleGeometry(scale * 0.08, 8), eyeMaterial);
    leftEye.position.set(-scale * 0.12, scale * 0.08, 0.02);
    headGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(new THREE.CircleGeometry(scale * 0.08, 8), eyeMaterial);
    rightEye.position.set(scale * 0.12, scale * 0.08, 0.02);
    headGroup.add(rightEye);
    
    const crownMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
    const crown = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(scale * 0.06, scale * 0.2, 4),
        crownMaterial
      );
      const angle = -0.4 + (i / 4) * 0.8;
      spike.position.set(Math.sin(angle) * scale * 0.3, scale * 0.4 + Math.cos(angle) * 0.1, 0);
      crown.add(spike);
    }
    headGroup.add(crown);
    
    group.add(headGroup);
    
    // CUERPO
    const bodyLine = new THREE.Mesh(
      new THREE.CylinderGeometry(lineThickness, lineThickness, scale * 1.0, 8),
      lineMaterial
    );
    bodyLine.position.y = scale * 1.5;
    group.add(bodyLine);
    
    // BRAZOS
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-lineThickness * 2, scale * 1.95, 0);
    
    const leftUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(lineThickness, lineThickness, scale * 0.5, 6),
      lineMaterial
    );
    leftUpperArm.position.y = -scale * 0.25;
    leftArmPivot.add(leftUpperArm);
    
    const leftArmJoint = new THREE.Group();
    leftArmJoint.position.y = -scale * 0.5;
    
    const leftLowerArm = new THREE.Mesh(
      new THREE.CylinderGeometry(lineThickness, lineThickness, scale * 0.5, 6),
      lineMaterial
    );
    leftLowerArm.position.y = -scale * 0.25;
    leftArmJoint.add(leftLowerArm);
    
    leftArmPivot.add(leftArmJoint);
    group.add(leftArmPivot);
    
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(lineThickness * 2, scale * 1.95, 0);
    
    const rightUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(lineThickness, lineThickness, scale * 0.5, 6),
      lineMaterial
    );
    rightUpperArm.position.y = -scale * 0.25;
    rightArmPivot.add(rightUpperArm);
    
    const rightArmJoint = new THREE.Group();
    rightArmJoint.position.y = -scale * 0.5;
    
    const rightLowerArm = new THREE.Mesh(
      new THREE.CylinderGeometry(lineThickness, lineThickness, scale * 0.5, 6),
      lineMaterial
    );
    rightLowerArm.position.y = -scale * 0.25;
    rightArmJoint.add(rightLowerArm);
    
    rightArmPivot.add(rightArmJoint);
    group.add(rightArmPivot);
    
    // PIERNAS
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-scale * 0.15, scale * 0.95, 0);
    
    const leftUpperLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(lineThickness, lineThickness, scale * 0.55, 6),
      lineMaterial
    );
    leftUpperLeg.position.y = -scale * 0.27;
    leftLegPivot.add(leftUpperLeg);
    
    const leftLegJoint = new THREE.Group();
    leftLegJoint.position.y = -scale * 0.55;
    
    const leftLowerLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(lineThickness, lineThickness, scale * 0.55, 6),
      lineMaterial
    );
    leftLowerLeg.position.y = -scale * 0.27;
    leftLegJoint.add(leftLowerLeg);
    
    leftLegPivot.add(leftLegJoint);
    group.add(leftLegPivot);
    
    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(scale * 0.15, scale * 0.95, 0);
    
    const rightUpperLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(lineThickness, lineThickness, scale * 0.55, 6),
      lineMaterial
    );
    rightUpperLeg.position.y = -scale * 0.27;
    rightLegPivot.add(rightUpperLeg);
    
    const rightLegJoint = new THREE.Group();
    rightLegJoint.position.y = -scale * 0.55;
    
    const rightLowerLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(lineThickness, lineThickness, scale * 0.55, 6),
      lineMaterial
    );
    rightLowerLeg.position.y = -scale * 0.27;
    rightLegJoint.add(rightLowerLeg);
    
    rightLegPivot.add(rightLegJoint);
    group.add(rightLegPivot);
    
    // Anillos de energía
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(scale * 0.8 + i * 0.3, 0.05, 8, 32),
        new THREE.MeshBasicMaterial({
          color: 0xff00ff,
          transparent: true,
          opacity: 0.5
        })
      );
      ring.position.y = scale * 1.5;
      group.add(ring);
      this.rings.push(ring);
    }
    
    group.position.set(0, 0, CONFIG.BOSS_SPAWN_Z);
    group.rotation.y = Math.PI;
    
    this.mesh = group;
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
    
    this.health = bossHealth;
    this.maxHealth = bossHealth;
    this.value = bossValue;
  }
  
  update(dt: number): void {
    if (this.z < -10) {
      this.z += this.bossSpeed * dt;
    }
    
    this.animationPhase += dt * 8;
    const phase = this.animationPhase;
    
    const leftLegAngle = Math.sin(phase) * 0.5;
    const rightLegAngle = Math.sin(phase + Math.PI) * 0.5;
    
    this.leftLegPivot.rotation.x = leftLegAngle;
    this.rightLegPivot.rotation.x = rightLegAngle;
    this.leftLegJoint.rotation.x = Math.max(0, -leftLegAngle) * 0.8 + 0.1;
    this.rightLegJoint.rotation.x = Math.max(0, -rightLegAngle) * 0.8 + 0.1;
    
    const leftArmAngle = Math.sin(phase + Math.PI) * 0.5;
    const rightArmAngle = Math.sin(phase) * 0.5;
    
    this.leftArmPivot.rotation.x = leftArmAngle;
    this.rightArmPivot.rotation.x = rightArmAngle;
    
    this.mesh.position.y = Math.abs(Math.sin(phase * 2)) * 0.2;
    
    for (let i = 0; i < this.rings.length; i++) {
      const ring = this.rings[i];
      ring.rotation.x = phase * 0.5 + i;
      ring.rotation.y = phase * 0.3 + i * 0.5;
      ring.rotation.z = phase * 0.2 + i * 0.3;
    }
  }
  
  takeDamage(amount: number): boolean {
    this.health -= amount;
    
    this.lineMaterial.color.setHex(0xffffff);
    setTimeout(() => {
      this.lineMaterial.color.setHex(0xff00ff);
    }, 100);
    
    if (this.health <= 0) {
      this.active = false;
      return true;
    }
    return false;
  }
  
  get healthPercent(): number {
    return this.health / this.maxHealth;
  }
}

