/**
 * ============================================
 * ENEMY3D - Enemigo Stickman optimizado con geometrías compartidas
 * ============================================
 */

import * as THREE from 'three';
import { Entity3D } from './Entity3D';
import { CONFIG } from '../types';
import { SharedGeometries, SharedMaterials } from '../SharedMaterials';

// Pre-calcular constantes
const ENEMY_SCALE = CONFIG.ENEMY_SIZE * 1.1;
const LINE_THICKNESS = 0.1;

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
  private healthBarMaterial: THREE.MeshBasicMaterial;

  private animationPhase: number;
  private hitTimer: number = 0;
  private isHit: boolean = false;

  constructor(x: number, z: number, health: number, speed?: number, value?: number) {
    const group = new THREE.Group();
    const geom = SharedGeometries.enemy;
    const mat = SharedMaterials;

    // CABEZA - usando geometrías compartidas
    const headGroup = new THREE.Group();
    headGroup.position.y = ENEMY_SCALE * 2.2;

    const headRing = new THREE.Mesh(geom.headRing, mat.enemyLine);
    headRing.rotation.x = Math.PI / 2;
    headGroup.add(headRing);

    const headFill = new THREE.Mesh(geom.headFill, mat.faceEnemyFill);
    headFill.position.z = 0.01;
    headGroup.add(headFill);

    const leftEye = new THREE.Mesh(geom.eye, mat.eyeEnemy);
    leftEye.position.set(-ENEMY_SCALE * 0.1, ENEMY_SCALE * 0.05, 0.02);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(geom.eye, mat.eyeEnemy);
    rightEye.position.set(ENEMY_SCALE * 0.1, ENEMY_SCALE * 0.05, 0.02);
    headGroup.add(rightEye);

    // Ceño fruncido - geometría pequeña, creada una vez
    const frownGeometry = new THREE.BufferGeometry();
    const frownPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 10; i++) {
      const angle = -(Math.PI * 0.25) - (i / 10) * (Math.PI * 0.5);
      frownPoints.push(new THREE.Vector3(
        Math.cos(angle) * ENEMY_SCALE * 0.15,
        -Math.sin(angle) * ENEMY_SCALE * 0.1 - ENEMY_SCALE * 0.12,
        0.02
      ));
    }
    frownGeometry.setFromPoints(frownPoints);
    const frown = new THREE.Line(frownGeometry, mat.frownLine);
    headGroup.add(frown);

    group.add(headGroup);

    // CUERPO - geometría compartida
    const bodyLine = new THREE.Mesh(geom.body, mat.enemyLine);
    bodyLine.position.y = ENEMY_SCALE * 1.5;
    group.add(bodyLine);

    // BRAZOS - geometrías compartidas
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-LINE_THICKNESS, ENEMY_SCALE * 1.95, 0);

    const leftUpperArm = new THREE.Mesh(geom.upperArm, mat.enemyLine);
    leftUpperArm.position.y = -ENEMY_SCALE * 0.22;
    leftArmPivot.add(leftUpperArm);

    const leftArmJoint = new THREE.Group();
    leftArmJoint.position.y = -ENEMY_SCALE * 0.45;

    const leftLowerArm = new THREE.Mesh(geom.lowerArm, mat.enemyLine);
    leftLowerArm.position.y = -ENEMY_SCALE * 0.2;
    leftArmJoint.add(leftLowerArm);

    leftArmPivot.add(leftArmJoint);
    group.add(leftArmPivot);

    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(LINE_THICKNESS, ENEMY_SCALE * 1.95, 0);

    const rightUpperArm = new THREE.Mesh(geom.upperArm, mat.enemyLine);
    rightUpperArm.position.y = -ENEMY_SCALE * 0.22;
    rightArmPivot.add(rightUpperArm);

    const rightArmJoint = new THREE.Group();
    rightArmJoint.position.y = -ENEMY_SCALE * 0.45;

    const rightLowerArm = new THREE.Mesh(geom.lowerArm, mat.enemyLine);
    rightLowerArm.position.y = -ENEMY_SCALE * 0.2;
    rightArmJoint.add(rightLowerArm);

    rightArmPivot.add(rightArmJoint);
    group.add(rightArmPivot);

    // PIERNAS - geometrías compartidas
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-ENEMY_SCALE * 0.1, ENEMY_SCALE * 0.95, 0);

    const leftUpperLeg = new THREE.Mesh(geom.upperLeg, mat.enemyLine);
    leftUpperLeg.position.y = -ENEMY_SCALE * 0.25;
    leftLegPivot.add(leftUpperLeg);

    const leftLegJoint = new THREE.Group();
    leftLegJoint.position.y = -ENEMY_SCALE * 0.5;

    const leftLowerLeg = new THREE.Mesh(geom.lowerLeg, mat.enemyLine);
    leftLowerLeg.position.y = -ENEMY_SCALE * 0.25;
    leftLegJoint.add(leftLowerLeg);

    leftLegPivot.add(leftLegJoint);
    group.add(leftLegPivot);

    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(ENEMY_SCALE * 0.1, ENEMY_SCALE * 0.95, 0);

    const rightUpperLeg = new THREE.Mesh(geom.upperLeg, mat.enemyLine);
    rightUpperLeg.position.y = -ENEMY_SCALE * 0.25;
    rightLegPivot.add(rightUpperLeg);

    const rightLegJoint = new THREE.Group();
    rightLegJoint.position.y = -ENEMY_SCALE * 0.5;

    const rightLowerLeg = new THREE.Mesh(geom.lowerLeg, mat.enemyLine);
    rightLowerLeg.position.y = -ENEMY_SCALE * 0.25;
    rightLegJoint.add(rightLowerLeg);

    rightLegPivot.add(rightLegJoint);
    group.add(rightLegPivot);

    group.position.set(x, 0, z);
    group.rotation.y = Math.PI;

    // BARRA DE VIDA - geometrías compartidas, material propio para el color dinámico
    const healthBarGroup = new THREE.Group();
    healthBarGroup.position.set(0, ENEMY_SCALE * 2.8, 0);
    healthBarGroup.rotation.y = -Math.PI;
    group.add(healthBarGroup);

    const healthBarBg = new THREE.Mesh(geom.healthBarBg, mat.healthBarBg);
    healthBarGroup.add(healthBarBg);

    // Material propio para la barra de vida (necesita cambiar de color)
    const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const healthBarFill = new THREE.Mesh(geom.healthBarFill, healthBarMaterial);
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
    this.healthBarFill = healthBarFill;
    this.healthBarBg = healthBarBg;
    this.healthBarMaterial = healthBarMaterial;

    this.health = health;
    this.maxHealth = health;
    this.speed = (speed ?? CONFIG.ENEMY_SPEED_BASE) + Math.random() * 2;
    this.value = value ?? 10;
    this.animationPhase = Math.random() * Math.PI * 2;
  }

  // Método para reiniciar un enemigo del pool
  reset(x: number, z: number, health: number, speed?: number, value?: number): void {
    this.x = x;
    this.z = z;
    this.health = health;
    this.maxHealth = health;
    this.speed = (speed ?? CONFIG.ENEMY_SPEED_BASE) + Math.random() * 2;
    this.value = value ?? 10;
    this.active = true;
    this.animationPhase = Math.random() * Math.PI * 2;
    this.hitTimer = 0;
    this.isHit = false;

    // Resetear barra de vida
    this.healthBarFill.scale.x = 1;
    this.healthBarFill.position.x = 0;
    this.healthBarMaterial.color.setRGB(0, 1, 0);

    // Resetear animación
    this.leftLegPivot.rotation.x = 0;
    this.rightLegPivot.rotation.x = 0;
    this.leftLegJoint.rotation.x = 0;
    this.rightLegJoint.rotation.x = 0;
    this.leftArmPivot.rotation.x = 0;
    this.rightArmPivot.rotation.x = 0;
    this.leftArmJoint.rotation.x = 0;
    this.rightArmJoint.rotation.x = 0;
    this.mesh.position.y = 0;
    this.bodyLine.rotation.z = 0;
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

    // Manejar efecto de hit sin setTimeout
    if (this.isHit) {
      this.hitTimer -= dt;
      if (this.hitTimer <= 0) {
        this.isHit = false;
        // Restaurar color - usando el material de las partes del cuerpo
        this.setBodyColor(0xffffff);
      }
    }

    if (this.z > 10) {
      this.active = false;
    }
  }

  private setBodyColor(color: number): void {
    // Los meshes usan SharedMaterials.enemyLine, no podemos cambiar su color
    // directamente sin afectar a todos los enemigos
    // En cambio, usamos la escala para el efecto visual de daño
  }

  updateHealthBar(): void {
    const healthPercent = Math.max(0.01, this.health / this.maxHealth);
    const barWidth = ENEMY_SCALE * 0.8 * 0.95;

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
    this.healthBarMaterial.color.setRGB(r, g, 0);
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;
    this.updateHealthBar();

    // Efecto de daño sin setTimeout - usar flag-based timing
    this.isHit = true;
    this.hitTimer = 0.08;

    // Efecto visual: escalar ligeramente
    this.mesh.scale.setScalar(1.1);
    setTimeout(() => {
      if (this.active) {
        this.mesh.scale.setScalar(1);
      }
    }, 50);

    if (this.health <= 0) {
      this.active = false;
      return true;
    }
    return false;
  }

  get reachedEnd(): boolean {
    return this.z > 8;
  }

  // Override destroy para no dispose geometrías compartidas
  destroy(scene: THREE.Scene | THREE.Group): void {
    scene.remove(this.mesh);
    // NO hacer dispose de geometrías/materiales porque son compartidos
  }
}
