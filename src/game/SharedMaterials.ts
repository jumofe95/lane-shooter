/**
 * ============================================
 * SHARED MATERIALS - Materiales reutilizables para optimización
 * ============================================
 */

import * as THREE from 'three';

// Materiales compartidos para evitar crear duplicados
export const SharedMaterials = {
  // Stickman jugador/aliados
  playerLine: new THREE.MeshBasicMaterial({ color: 0x003366 }),
  
  // Stickman enemigos
  enemyLine: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  enemyLineHit: new THREE.MeshBasicMaterial({ color: 0xff0000 }),
  
  // Boss
  bossLine: new THREE.MeshBasicMaterial({ color: 0xff00ff }),
  
  // Caras
  faceFill: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  faceEnemyFill: new THREE.MeshBasicMaterial({ color: 0x222222 }),
  faceBossFill: new THREE.MeshBasicMaterial({ color: 0x220022 }),
  eye: new THREE.MeshBasicMaterial({ color: 0x000000 }),
  eyeEnemy: new THREE.MeshBasicMaterial({ color: 0xff0000 }),
  eyeBoss: new THREE.MeshBasicMaterial({ color: 0xffff00 }),
  
  // Armas
  gun: new THREE.MeshBasicMaterial({ color: 0x222222 }),
  
  // Balas
  bulletPlayer: new THREE.MeshBasicMaterial({ color: 0xffff00 }),
  bulletEnemy: new THREE.MeshBasicMaterial({ color: 0xff8800 }),
  bulletTrailPlayer: new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.5 }),
  bulletTrailEnemy: new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0.5 }),
  
  // Barras de vida
  healthBarBg: new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.DoubleSide }),
  healthBarGreen: new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide }),
  
  // Boss rings
  bossRing: new THREE.MeshBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.5 }),
  bossCrown: new THREE.MeshBasicMaterial({ color: 0xffdd00 }),
};

// Geometrías compartidas para objetos comunes
export const SharedGeometries = {
  // Segmentos reducidos para móviles
  segments: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 4 : 6,
  torusSegments: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 12 : 20,
  circleSegments: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 12 : 24,
  
  // Bala
  bullet: new THREE.SphereGeometry(0.3, 6, 6),
};

