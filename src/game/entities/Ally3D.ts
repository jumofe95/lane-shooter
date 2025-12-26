/**
 * ============================================
 * ALLY3D - Aliado stickman estilo clásico con pistola
 * ============================================
 */

import * as THREE from 'three';
import { Entity3D } from './Entity3D';
import { Bullet3D } from './Bullet3D';
import { Player3D } from './Player3D';
import { CONFIG, COLORS } from '../types';

export class Ally3D extends Entity3D {
  private shootTimer: number = 0;
  private shootOffset: number;
  targetX: number;
  targetZ: number;
  index: number;
  
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
  private gunGroup: THREE.Group;
  
  private lineMaterial: THREE.MeshBasicMaterial;
  private walkPhase: number = 0;
  private shootRecoil: number = 0;
  
  constructor(x: number, z: number, index: number) {
    const group = new THREE.Group();
    
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x006633 });
    const lineThickness = 0.06;
    
    const scale = CONFIG.ALLY_SIZE * 0.85;
    
    // CABEZA
    const headGroup = new THREE.Group();
    headGroup.position.y = scale * 2.4;
    
    const headRing = new THREE.Mesh(
      new THREE.TorusGeometry(scale * 0.32, lineThickness, 8, 20),
      lineMaterial
    );
    headRing.rotation.x = Math.PI / 2;
    headGroup.add(headRing);
    
    const headFill = new THREE.Mesh(
      new THREE.CircleGeometry(scale * 0.31, 20),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    headFill.position.z = 0.01;
    headGroup.add(headFill);
    
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(new THREE.CircleGeometry(scale * 0.04, 6), eyeMaterial);
    leftEye.position.set(-scale * 0.1, scale * 0.06, 0.02);
    headGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(new THREE.CircleGeometry(scale * 0.04, 6), eyeMaterial);
    rightEye.position.set(scale * 0.1, scale * 0.06, 0.02);
    headGroup.add(rightEye);
    
    const smileGeometry = new THREE.BufferGeometry();
    const smilePoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 8; i++) {
      const angle = (Math.PI * 0.25) + (i / 8) * (Math.PI * 0.5);
      smilePoints.push(new THREE.Vector3(
        Math.cos(angle) * scale * 0.14,
        -Math.sin(angle) * scale * 0.08 - scale * 0.04,
        0.02
      ));
    }
    smileGeometry.setFromPoints(smilePoints);
    const smile = new THREE.Line(smileGeometry, new THREE.LineBasicMaterial({ color: 0x000000 }));
    headGroup.add(smile);
    
    group.add(headGroup);
    
    // CUERPO
    const bodyLine = new THREE.Mesh(
      new THREE.CylinderGeometry(lineThickness, lineThickness, scale * 1.1, 6),
      lineMaterial
    );
    bodyLine.position.y = scale * 1.55;
    group.add(bodyLine);
    
    // BRAZO IZQUIERDO CON PISTOLA
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-lineThickness, scale * 2.0, 0);
    
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
    
    const gunGroup = new THREE.Group();
    gunGroup.position.y = -scale * 0.4;
    
    const gunBody = new THREE.Mesh(
      new THREE.BoxGeometry(scale * 0.06, scale * 0.12, scale * 0.2),
      new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    gunGroup.add(gunBody);
    
    const gunBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(scale * 0.025, scale * 0.025, scale * 0.15, 6),
      new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    gunBarrel.rotation.x = Math.PI / 2;
    gunBarrel.position.z = -scale * 0.15;
    gunGroup.add(gunBarrel);
    
    leftArmJoint.add(gunGroup);
    leftArmPivot.add(leftArmJoint);
    
    leftArmPivot.rotation.x = -1.2;
    leftArmPivot.rotation.z = 0.3;
    leftArmJoint.rotation.x = -0.5;
    
    group.add(leftArmPivot);
    
    // BRAZO DERECHO
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(lineThickness, scale * 2.0, 0);
    
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
    leftLegPivot.position.set(-scale * 0.08, scale * 0.95, 0);
    
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
    rightLegPivot.position.set(scale * 0.08, scale * 0.95, 0);
    
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
    this.gunGroup = gunGroup;
    this.lineMaterial = lineMaterial;
    
    this.index = index;
    this.targetX = x;
    this.targetZ = z;
    this.shootOffset = (index * 0.2) % 1;
    this.shootTimer = this.shootOffset;
    this.walkPhase = index * 0.7;
  }
  
  update(dt: number): void {
    const dx = this.targetX - this.x;
    const dz = this.targetZ - this.z;
    const isMoving = Math.abs(dx) > 0.1 || Math.abs(dz) > 0.1;
    
    const smoothing = 6;
    this.x += dx * smoothing * dt;
    this.z += dz * smoothing * dt;
    
    this.mesh.rotation.z = -dx * 0.2;
    
    if (isMoving) {
      this.walkPhase += dt * 10;
      const phase = this.walkPhase;
      
      const leftLegAngle = Math.sin(phase) * 0.4;
      const rightLegAngle = Math.sin(phase + Math.PI) * 0.4;
      
      this.leftLegPivot.rotation.x = leftLegAngle;
      this.rightLegPivot.rotation.x = rightLegAngle;
      this.leftLegJoint.rotation.x = Math.max(0, -leftLegAngle) * 0.7 + 0.1;
      this.rightLegJoint.rotation.x = Math.max(0, -rightLegAngle) * 0.7 + 0.1;
      
      this.rightArmPivot.rotation.x = Math.sin(phase + Math.PI) * 0.3;
      this.rightArmJoint.rotation.x = -Math.max(0, Math.sin(phase + Math.PI)) * 0.4 - 0.15;
      
      this.mesh.position.y = Math.abs(Math.sin(phase * 2)) * 0.08;
    } else {
      this.walkPhase += dt * 2;
      
      this.leftLegPivot.rotation.x *= 0.9;
      this.rightLegPivot.rotation.x *= 0.9;
      this.leftLegJoint.rotation.x = this.leftLegJoint.rotation.x * 0.9 + 0.05;
      this.rightLegJoint.rotation.x = this.rightLegJoint.rotation.x * 0.9 + 0.05;
      this.rightArmPivot.rotation.x *= 0.9;
      this.rightArmJoint.rotation.x = this.rightArmJoint.rotation.x * 0.9 - 0.08;
      this.mesh.position.y *= 0.9;
    }
    
    this.shootTimer += dt;
    
    if (this.shootRecoil > 0) {
      this.shootRecoil -= dt * 10;
      this.leftArmPivot.rotation.x = -1.2 + this.shootRecoil * 0.35;
      this.gunGroup.position.z = this.shootRecoil * 0.08;
    } else {
      this.leftArmPivot.rotation.x = -1.2;
      this.gunGroup.position.z = 0;
    }
  }
  
  setTargetPosition(x: number, z: number): void {
    this.targetX = x;
    this.targetZ = z;
  }
  
  tryShoot(player: Player3D, scene: THREE.Group): Bullet3D | null {
    const shootInterval = 1 / player.stats.fireRate;
    
    if (this.shootTimer >= shootInterval) {
      this.shootTimer = this.shootOffset;
      this.shootRecoil = 1;
      
      const bullet = new Bullet3D(
        this.x - 0.25,
        this.z - 1.0,
        player.stats.damage,
        player.stats.piercing,
        true
      );
      scene.add(bullet.mesh);
      
      return bullet;
    }
    
    return null;
  }
}

