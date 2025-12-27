/**
 * ============================================
 * ALLY3D - Aliado stickman optimizado con geometrías compartidas
 * ============================================
 */

import * as THREE from 'three';
import { Entity3D } from './Entity3D';
import { Bullet3D } from './Bullet3D';
import { Player3D } from './Player3D';
import { CONFIG } from '../types';
import { SharedGeometries, SharedMaterials } from '../SharedMaterials';
import { bulletPool } from '../systems/ObjectPool';

// Pre-calcular constantes
const PLAYER_SCALE = CONFIG.PLAYER_SIZE * 1.2;
const LINE_THICKNESS = 0.08;

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

  private walkPhase: number = 0;
  private shootRecoil: number = 0;

  constructor(x: number, z: number, index: number) {
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

    // Sonrisa - geometría pequeña
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

    this.index = index;
    this.targetX = x;
    this.targetZ = z;
    // Pequeño offset inicial solo para evitar que todos disparen en el mismo frame
    this.shootOffset = (index * 0.15) % 0.5;
    this.shootTimer = this.shootOffset;
    this.walkPhase = index * 0.7;
  }

  // Método para reiniciar un aliado del pool
  reset(x: number, z: number, index: number): void {
    this.x = x;
    this.z = z;
    this.index = index;
    this.targetX = x;
    this.targetZ = z;
    this.active = true;
    // Pequeño offset inicial solo para evitar que todos disparen en el mismo frame
    // pero la cadencia será exactamente la misma
    this.shootOffset = (index * 0.15) % 0.5;
    this.shootTimer = this.shootOffset;
    this.walkPhase = index * 0.7;
    this.shootRecoil = 0;

    // Resetear animación
    this.leftLegPivot.rotation.x = 0;
    this.rightLegPivot.rotation.x = 0;
    this.leftLegJoint.rotation.x = 0.05;
    this.rightLegJoint.rotation.x = 0.05;
    this.rightArmPivot.rotation.x = 0;
    this.rightArmJoint.rotation.x = -0.08;
    this.leftArmPivot.rotation.x = -1.2;
    this.leftArmJoint.rotation.x = -0.5;
    this.mesh.position.y = 0;
    this.mesh.rotation.z = 0;
    this.gunGroup.position.z = 0;
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
      // Resetear a 0 para mantener exactamente la misma cadencia que el jugador
      this.shootTimer = 0;
      this.shootRecoil = 1;

      // Usar pool de balas
      const bullet = bulletPool.get(
        this.x - 0.25,
        this.z - 1.0,
        player.stats.damage,
        player.stats.piercing,
        true
      );

      return bullet;
    }

    return null;
  }

  // Override destroy para no dispose geometrías compartidas
  destroy(scene: THREE.Scene | THREE.Group): void {
    scene.remove(this.mesh);
    // NO hacer dispose de geometrías/materiales porque son compartidos
  }
}
