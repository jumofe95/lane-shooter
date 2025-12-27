/**
 * ============================================
 * PLAYER3D - Stickman jugador optimizado con geometrías compartidas
 * ============================================
 */

import * as THREE from 'three';
import { Entity3D } from './Entity3D';
import { Bullet3D } from './Bullet3D';
import { PlayerStats, CONFIG } from '../types';
import { SharedGeometries, SharedMaterials } from '../SharedMaterials';
import { bulletPool } from '../systems/ObjectPool';

// Pre-calcular constantes
const PLAYER_SCALE = CONFIG.PLAYER_SIZE * 1.2;
const LINE_THICKNESS = 0.08;

export class Player3D extends Entity3D {
  stats: PlayerStats;
  health: number = 100;
  maxHealth: number = 100;
  private shootTimer: number = 0;
  targetX: number = 0;

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

  private walkPhase: number = 0;
  private shootRecoil: number = 0;
  private isMoving: boolean = false;
  private hitTimer: number = 0;
  private isHit: boolean = false;

  constructor() {
    const group = new THREE.Group();
    const geom = SharedGeometries.ally;
    const mat = SharedMaterials;

    // CABEZA - usando geometrías compartidas
    const headGroup = new THREE.Group();
    headGroup.position.y = PLAYER_SCALE * 2.4;

    const headRing = new THREE.Mesh(geom.headRing, mat.playerLine);
    headRing.rotation.x = Math.PI / 2;
    headGroup.add(headRing);

    const headFill = new THREE.Mesh(geom.headFill, mat.faceFill);
    headFill.position.z = 0.01;
    headGroup.add(headFill);

    const leftEye = new THREE.Mesh(geom.eye, mat.eye);
    leftEye.position.set(-PLAYER_SCALE * 0.12, PLAYER_SCALE * 0.08, 0.02);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(geom.eye, mat.eye);
    rightEye.position.set(PLAYER_SCALE * 0.12, PLAYER_SCALE * 0.08, 0.02);
    headGroup.add(rightEye);

    // Sonrisa
    const smileGeometry = new THREE.BufferGeometry();
    const smilePoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 12; i++) {
      const angle = (Math.PI * 0.2) + (i / 12) * (Math.PI * 0.6);
      smilePoints.push(new THREE.Vector3(
        Math.cos(angle) * PLAYER_SCALE * 0.18,
        -Math.sin(angle) * PLAYER_SCALE * 0.1 - PLAYER_SCALE * 0.05,
        0.02
      ));
    }
    smileGeometry.setFromPoints(smilePoints);
    const smile = new THREE.Line(smileGeometry, mat.smileLine);
    headGroup.add(smile);

    group.add(headGroup);

    // CUERPO - geometría compartida
    const bodyLine = new THREE.Mesh(geom.body, mat.playerLine);
    bodyLine.position.y = PLAYER_SCALE * 1.6;
    group.add(bodyLine);

    // BRAZO IZQUIERDO CON PISTOLA - geometrías compartidas
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-LINE_THICKNESS, PLAYER_SCALE * 2.1, 0);

    const leftUpperArm = new THREE.Mesh(geom.upperArm, mat.playerLine);
    leftUpperArm.position.y = -PLAYER_SCALE * 0.25;
    leftArmPivot.add(leftUpperArm);

    const leftArmJoint = new THREE.Group();
    leftArmJoint.position.y = -PLAYER_SCALE * 0.5;

    const leftLowerArm = new THREE.Mesh(geom.lowerArm, mat.playerLine);
    leftLowerArm.position.y = -PLAYER_SCALE * 0.22;
    leftArmJoint.add(leftLowerArm);

    // Pistola - geometrías compartidas
    const gunGroup = new THREE.Group();
    gunGroup.position.y = -PLAYER_SCALE * 0.45;

    const gunBody = new THREE.Mesh(geom.gunBody, mat.gun);
    gunGroup.add(gunBody);

    const gunBarrel = new THREE.Mesh(geom.gunBarrel, mat.gun);
    gunBarrel.rotation.x = Math.PI / 2;
    gunBarrel.position.z = -PLAYER_SCALE * 0.2;
    gunGroup.add(gunBarrel);

    leftArmJoint.add(gunGroup);
    leftArmPivot.add(leftArmJoint);

    leftArmPivot.rotation.x = -1.2;
    leftArmPivot.rotation.z = 0.3;
    leftArmJoint.rotation.x = -0.5;

    group.add(leftArmPivot);

    // BRAZO DERECHO - geometrías compartidas
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(LINE_THICKNESS, PLAYER_SCALE * 2.1, 0);

    const rightUpperArm = new THREE.Mesh(geom.upperArm, mat.playerLine);
    rightUpperArm.position.y = -PLAYER_SCALE * 0.25;
    rightArmPivot.add(rightUpperArm);

    const rightArmJoint = new THREE.Group();
    rightArmJoint.position.y = -PLAYER_SCALE * 0.5;

    const rightLowerArm = new THREE.Mesh(geom.lowerArm, mat.playerLine);
    rightLowerArm.position.y = -PLAYER_SCALE * 0.22;
    rightArmJoint.add(rightLowerArm);

    rightArmPivot.add(rightArmJoint);
    group.add(rightArmPivot);

    // PIERNAS - geometrías compartidas
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-PLAYER_SCALE * 0.1, PLAYER_SCALE * 1.0, 0);

    const leftUpperLeg = new THREE.Mesh(geom.upperLeg, mat.playerLine);
    leftUpperLeg.position.y = -PLAYER_SCALE * 0.27;
    leftLegPivot.add(leftUpperLeg);

    const leftLegJoint = new THREE.Group();
    leftLegJoint.position.y = -PLAYER_SCALE * 0.55;

    const leftLowerLeg = new THREE.Mesh(geom.lowerLeg, mat.playerLine);
    leftLowerLeg.position.y = -PLAYER_SCALE * 0.27;
    leftLegJoint.add(leftLowerLeg);

    leftLegPivot.add(leftLegJoint);
    group.add(leftLegPivot);

    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(PLAYER_SCALE * 0.1, PLAYER_SCALE * 1.0, 0);

    const rightUpperLeg = new THREE.Mesh(geom.upperLeg, mat.playerLine);
    rightUpperLeg.position.y = -PLAYER_SCALE * 0.27;
    rightLegPivot.add(rightUpperLeg);

    const rightLegJoint = new THREE.Group();
    rightLegJoint.position.y = -PLAYER_SCALE * 0.55;

    const rightLowerLeg = new THREE.Mesh(geom.lowerLeg, mat.playerLine);
    rightLowerLeg.position.y = -PLAYER_SCALE * 0.27;
    rightLegJoint.add(rightLowerLeg);

    rightLegPivot.add(rightLegJoint);
    group.add(rightLegPivot);

    group.position.set(0, 0, CONFIG.PLAYER_Z);

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

    this.stats = {
      numAllies: 0,
      fireRate: 3,
      damage: 10,
      piercing: 1
    };
  }
  
  update(dt: number): void {
    const diff = this.targetX - this.x;
    this.isMoving = Math.abs(diff) > 0.05;

    if (this.isMoving) {
      this.x += diff * 10 * dt;
      this.mesh.rotation.z = -diff * 0.1;

      this.walkPhase += dt * 12;
      const phase = this.walkPhase;

      const leftLegAngle = Math.sin(phase) * 0.5;
      const rightLegAngle = Math.sin(phase + Math.PI) * 0.5;

      this.leftLegPivot.rotation.x = leftLegAngle;
      this.rightLegPivot.rotation.x = rightLegAngle;

      this.leftLegJoint.rotation.x = Math.max(0, -leftLegAngle) * 0.8 + 0.1;
      this.rightLegJoint.rotation.x = Math.max(0, -rightLegAngle) * 0.8 + 0.1;

      this.rightArmPivot.rotation.x = Math.sin(phase + Math.PI) * 0.4;
      this.rightArmJoint.rotation.x = -Math.max(0, Math.sin(phase + Math.PI)) * 0.5 - 0.2;

      this.mesh.position.y = Math.abs(Math.sin(phase * 2)) * 0.1;

    } else {
      this.x = this.targetX;
      this.mesh.rotation.z *= 0.9;
      this.mesh.position.y *= 0.9;

      this.walkPhase += dt * 2;
      const breathe = Math.sin(this.walkPhase) * 0.02;
      this.bodyLine.scale.y = 1 + breathe;

      this.leftLegPivot.rotation.x *= 0.9;
      this.rightLegPivot.rotation.x *= 0.9;
      this.leftLegJoint.rotation.x = this.leftLegJoint.rotation.x * 0.9 + 0.05;
      this.rightLegJoint.rotation.x = this.rightLegJoint.rotation.x * 0.9 + 0.05;

      this.rightArmPivot.rotation.x *= 0.9;
      this.rightArmJoint.rotation.x = this.rightArmJoint.rotation.x * 0.9 - 0.1;
    }

    const halfWidth = CONFIG.GAME_WIDTH / 2 - CONFIG.PLAYER_SIZE;
    this.x = Math.max(-halfWidth, Math.min(halfWidth, this.x));
    this.targetX = Math.max(-halfWidth, Math.min(halfWidth, this.targetX));

    this.shootTimer += dt;

    if (this.shootRecoil > 0) {
      this.shootRecoil -= dt * 8;
      this.leftArmPivot.rotation.x = -1.2 + this.shootRecoil * 0.4;
      this.gunGroup.position.z = this.shootRecoil * 0.1;
    } else {
      this.leftArmPivot.rotation.x = -1.2;
      this.gunGroup.position.z = 0;
    }

    // Manejar efecto de hit sin setTimeout
    if (this.isHit) {
      this.hitTimer -= dt;
      if (this.hitTimer <= 0) {
        this.isHit = false;
        this.mesh.scale.setScalar(1);
      }
    }
  }
  
  move(direction: number, dt: number): void {
    this.targetX += direction * CONFIG.PLAYER_SPEED * dt;
  }
  
  setTargetX(x: number): void {
    const halfWidth = CONFIG.GAME_WIDTH / 2 - CONFIG.PLAYER_SIZE;
    this.targetX = Math.max(-halfWidth, Math.min(halfWidth, x));
  }
  
  tryShoot(scene: THREE.Group): Bullet3D | null {
    const shootInterval = 1 / this.stats.fireRate;

    if (this.shootTimer >= shootInterval) {
      this.shootTimer = 0;
      this.shootRecoil = 1;

      // Usar pool de balas
      const bullet = bulletPool.get(
        this.x - 0.4,
        this.z - 1.8,
        this.stats.damage,
        this.stats.piercing,
        true
      );

      return bullet;
    }

    return null;
  }
  
  applyModifier(type: string, value: number): void {
    switch (type) {
      case 'add_allies':
        this.stats.numAllies = Math.max(0, this.stats.numAllies + value);
        break;
      case 'remove_allies':
        this.stats.numAllies = Math.max(0, this.stats.numAllies - value);
        break;
      case 'multiply_allies':
        this.stats.numAllies = Math.max(0, Math.floor(this.stats.numAllies * value));
        break;
      case 'fire_rate':
        this.stats.fireRate = Math.max(0.5, this.stats.fireRate + value);
        break;
      case 'damage':
        this.stats.damage = Math.max(1, this.stats.damage + value);
        break;
      case 'piercing':
        this.stats.piercing = Math.max(1, this.stats.piercing + value);
        break;
    }
  }
  
  takeDamage(amount: number): boolean {
    this.health -= amount;

    // Efecto visual sin setTimeout
    this.isHit = true;
    this.hitTimer = 0.1;
    this.mesh.scale.setScalar(1.15);

    if (this.health <= 0) {
      this.health = 0;
      return true;
    }
    return false;
  }
  
  get healthPercent(): number {
    return this.health / this.maxHealth;
  }
}

