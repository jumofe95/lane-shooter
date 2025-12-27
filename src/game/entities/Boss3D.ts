/**
 * ============================================
 * BOSS3D - Jefe Stickman gigante con barra de vida y ataques especiales
 * ============================================
 */

import * as THREE from 'three';
import { Entity3D } from './Entity3D';
import { CONFIG, COLORS } from '../types';
import { BossProjectile, ProjectileType } from './BossProjectile';

export type BossAttackType = 'triple_shot' | 'wave' | 'rain' | 'laser_sweep' | 'minion_call';

export class Boss3D extends Entity3D {
  health: number;
  maxHealth: number;
  value: number = 100;
  level: number = 1;
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
  
  // Sistema de ataques especiales
  private attackTimer: number = 0;
  private attackCooldown: number = 3;
  private isAttacking: boolean = false;
  private attackPhase: number = 0;
  attackType: BossAttackType = 'triple_shot';
  
  // Movimiento lateral
  private lateralSpeed: number = 0;
  private lateralDirection: number = 1;
  private lateralAmplitude: number = 0;
  
  constructor(health?: number, speed?: number, value?: number, level?: number) {
    const group = new THREE.Group();
    
    super(group);
    
    // Guardar valores de configuración
    const bossHealth = health ?? CONFIG.BOSS_HEALTH_BASE;
    const bossSpeedVal = speed ?? CONFIG.BOSS_SPEED_BASE;
    const bossValue = value ?? 100;
    this.level = level ?? 1;
    
    this.bossSpeed = bossSpeedVal;
    
    // Asignar ataque especial según el nivel
    this.attackType = this.getAttackTypeForLevel(this.level);
    this.attackCooldown = this.getAttackCooldownForLevel(this.level);
    
    // Movimiento lateral - más rápido y amplio según el nivel
    this.lateralSpeed = 1 + this.level * 0.5; // Velocidad: 1.5 a 6
    this.lateralAmplitude = CONFIG.GAME_WIDTH * 0.25 + this.level * 0.3; // Amplitud crece con nivel
    this.lateralDirection = Math.random() > 0.5 ? 1 : -1; // Dirección inicial aleatoria
    
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
    // Avance hacia el jugador
    if (this.z < -10) {
      this.z += this.bossSpeed * dt;
    }
    
    // Movimiento lateral
    this.x += this.lateralSpeed * this.lateralDirection * dt;
    
    // Cambiar dirección al llegar a los límites
    const maxX = this.lateralAmplitude;
    if (this.x > maxX) {
      this.x = maxX;
      this.lateralDirection = -1;
    } else if (this.x < -maxX) {
      this.x = -maxX;
      this.lateralDirection = 1;
    }
    
    // Inclinación visual al moverse
    this.mesh.rotation.z = -this.lateralDirection * 0.1;
    
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
  
  // Determinar tipo de ataque según nivel
  private getAttackTypeForLevel(level: number): BossAttackType {
    if (level <= 2) return 'triple_shot';      // Niveles 1-2: Disparo triple
    if (level <= 4) return 'wave';             // Niveles 3-4: Onda expansiva
    if (level <= 6) return 'rain';             // Niveles 5-6: Lluvia de proyectiles
    if (level <= 8) return 'laser_sweep';      // Niveles 7-8: Barrido láser
    return 'minion_call';                       // Niveles 9-10: Combo de ataques
  }
  
  private getAttackCooldownForLevel(level: number): number {
    // Bosses más difíciles atacan más seguido
    return Math.max(1.5, 3.5 - level * 0.2);
  }
  
  // Actualizar ataque - devuelve proyectiles generados
  updateAttack(dt: number, playerX: number): BossProjectile[] {
    const projectiles: BossProjectile[] = [];
    
    // Solo atacar cuando está en posición
    if (this.z > -8) return projectiles;
    
    this.attackTimer += dt;
    
    if (this.attackTimer >= this.attackCooldown) {
      this.attackTimer = 0;
      this.isAttacking = true;
      this.attackPhase = 0;
      
      // Generar proyectiles según el tipo de ataque
      const newProjectiles = this.executeAttack(playerX);
      projectiles.push(...newProjectiles);
    }
    
    // Animación de ataque
    if (this.isAttacking) {
      this.attackPhase += dt * 5;
      if (this.attackPhase >= 1) {
        this.isAttacking = false;
      }
    }
    
    return projectiles;
  }
  
  private executeAttack(playerX: number): BossProjectile[] {
    const projectiles: BossProjectile[] = [];
    const baseDamage = 10 + this.level * 3;
    
    switch (this.attackType) {
      case 'triple_shot':
        // Disparo triple hacia el jugador
        for (let i = -1; i <= 1; i++) {
          const angle = Math.atan2(playerX - this.x, 15) + i * 0.3;
          const dir = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
          projectiles.push(new BossProjectile(this.x, this.z + 1, baseDamage, 'orb', dir, 10));
        }
        break;
        
      case 'wave':
        // Ráfaga de ondas + disparos direccionales
        // Onda central
        projectiles.push(new BossProjectile(this.x, this.z + 1, baseDamage, 'wave'));
        
        // Disparos en abanico (5 direcciones)
        for (let i = -2; i <= 2; i++) {
          const angle = i * 0.25;
          const dir = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
          projectiles.push(new BossProjectile(this.x, this.z + 1, baseDamage * 0.8, 'orb', dir, 8));
        }
        
        // Disparos laterales rápidos
        const leftDir = new THREE.Vector3(-0.7, 0, 0.7);
        const rightDir = new THREE.Vector3(0.7, 0, 0.7);
        projectiles.push(new BossProjectile(this.x - 1, this.z + 1, baseDamage, 'orb', leftDir, 12));
        projectiles.push(new BossProjectile(this.x + 1, this.z + 1, baseDamage, 'orb', rightDir, 12));
        break;
        
      case 'rain':
        // Lluvia de proyectiles desde arriba
        const rainCount = 5 + Math.floor(this.level / 2);
        for (let i = 0; i < rainCount; i++) {
          const rainX = (Math.random() - 0.5) * CONFIG.GAME_WIDTH * 0.8;
          const rainZ = this.z + 5 + Math.random() * 10;
          const proj = new BossProjectile(rainX, rainZ, baseDamage * 0.7, 'rain');
          proj.mesh.position.y = 5 + Math.random() * 2;
          projectiles.push(proj);
        }
        break;
        
      case 'laser_sweep':
        // Barrido de láser horizontal
        const laserCount = 3;
        for (let i = 0; i < laserCount; i++) {
          const laserX = -CONFIG.GAME_WIDTH / 3 + (i * CONFIG.GAME_WIDTH / 3);
          const dir = new THREE.Vector3(0, 0, 1);
          const laser = new BossProjectile(laserX, this.z + 1, baseDamage * 1.2, 'laser', dir, 15);
          laser.mesh.rotation.x = Math.PI / 2;
          projectiles.push(laser);
        }
        break;
        
      case 'minion_call':
        // Combo: disparo + onda (bosses finales)
        // Disparo central
        const centerDir = new THREE.Vector3(0, 0, 1);
        projectiles.push(new BossProjectile(this.x, this.z + 1, baseDamage, 'orb', centerDir, 12));
        
        // Disparos laterales
        for (let i = -1; i <= 1; i += 2) {
          const sideAngle = i * 0.5;
          const sideDir = new THREE.Vector3(Math.sin(sideAngle), 0, Math.cos(sideAngle));
          projectiles.push(new BossProjectile(this.x, this.z + 1, baseDamage * 0.8, 'orb', sideDir, 8));
        }
        
        // Mini onda
        const miniWave = new BossProjectile(this.x, this.z + 1, baseDamage * 0.5, 'wave');
        miniWave.maxLifetime = 2;
        projectiles.push(miniWave);
        break;
    }
    
    return projectiles;
  }
  
  // Obtener nombre del ataque para mostrar
  getAttackName(): string {
    switch (this.attackType) {
      case 'triple_shot': return '⚡ Disparo Triple';
      case 'wave': return '🌊 Onda Expansiva';
      case 'rain': return '☔ Lluvia Mortal';
      case 'laser_sweep': return '⚡ Barrido Láser';
      case 'minion_call': return '💀 Furia Final';
    }
  }
}

