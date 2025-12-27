/**
 * ============================================
 * SHARED MATERIALS - Materiales y geometrías reutilizables para optimización
 * ============================================
 */

import * as THREE from 'three';
import { CONFIG } from './types';

// Detectar móvil una sola vez
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Segmentos reducidos para móviles
const SEGMENTS = isMobile ? 4 : 6;
const TORUS_SEGMENTS = isMobile ? 12 : 20;
const CIRCLE_SEGMENTS = isMobile ? 12 : 24;

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

  // Líneas para sonrisas/ceños
  smileLine: new THREE.LineBasicMaterial({ color: 0x000000 }),
  frownLine: new THREE.LineBasicMaterial({ color: 0xff0000 }),
};

// Escalas para los diferentes tipos de stickmen
const enemyScale = CONFIG.ENEMY_SIZE * 1.1;
const playerScale = CONFIG.PLAYER_SIZE * 1.2;
const lineThicknessEnemy = 0.1;
const lineThicknessPlayer = 0.08;

// Geometrías compartidas para objetos comunes
export const SharedGeometries = {
  // Segmentos (para referencia)
  segments: SEGMENTS,
  torusSegments: TORUS_SEGMENTS,
  circleSegments: CIRCLE_SEGMENTS,

  // Bala
  bullet: new THREE.SphereGeometry(0.3, 6, 6),

  // === GEOMETRÍAS DE ENEMIGOS ===
  enemy: {
    // Cabeza
    headRing: new THREE.TorusGeometry(enemyScale * 0.32, lineThicknessEnemy, 6, TORUS_SEGMENTS),
    headFill: new THREE.CircleGeometry(enemyScale * 0.31, TORUS_SEGMENTS),
    eye: new THREE.CircleGeometry(enemyScale * 0.06, 6),

    // Cuerpo
    body: new THREE.CylinderGeometry(lineThicknessEnemy, lineThicknessEnemy, enemyScale * 1.0, SEGMENTS),

    // Brazos
    upperArm: new THREE.CylinderGeometry(lineThicknessEnemy, lineThicknessEnemy, enemyScale * 0.45, 6),
    lowerArm: new THREE.CylinderGeometry(lineThicknessEnemy, lineThicknessEnemy, enemyScale * 0.4, 6),

    // Piernas
    upperLeg: new THREE.CylinderGeometry(lineThicknessEnemy, lineThicknessEnemy, enemyScale * 0.5, 6),
    lowerLeg: new THREE.CylinderGeometry(lineThicknessEnemy, lineThicknessEnemy, enemyScale * 0.5, 6),

    // Barra de vida
    healthBarBg: new THREE.PlaneGeometry(enemyScale * 0.8, 0.2),
    healthBarFill: new THREE.PlaneGeometry(enemyScale * 0.8 * 0.95, 0.2 * 0.7),
  },

  // === GEOMETRÍAS DE ALIADOS/JUGADOR ===
  ally: {
    // Cabeza
    headRing: new THREE.TorusGeometry(playerScale * 0.35, lineThicknessPlayer, 8, 24),
    headFill: new THREE.CircleGeometry(playerScale * 0.34, 24),
    eye: new THREE.CircleGeometry(playerScale * 0.05, 8),

    // Cuerpo
    body: new THREE.CylinderGeometry(lineThicknessPlayer, lineThicknessPlayer, playerScale * 1.2, 6),

    // Brazos
    upperArm: new THREE.CylinderGeometry(lineThicknessPlayer, lineThicknessPlayer, playerScale * 0.5, 6),
    lowerArm: new THREE.CylinderGeometry(lineThicknessPlayer, lineThicknessPlayer, playerScale * 0.45, 6),

    // Piernas
    upperLeg: new THREE.CylinderGeometry(lineThicknessPlayer, lineThicknessPlayer, playerScale * 0.55, 6),
    lowerLeg: new THREE.CylinderGeometry(lineThicknessPlayer, lineThicknessPlayer, playerScale * 0.55, 6),

    // Pistola
    gunBody: new THREE.BoxGeometry(playerScale * 0.08, playerScale * 0.15, playerScale * 0.25),
    gunBarrel: new THREE.CylinderGeometry(playerScale * 0.03, playerScale * 0.03, playerScale * 0.2, 6),
  },

  // === GEOMETRÍAS DE GATES ===
  gate: {
    frameVertical: new THREE.BoxGeometry(0.15, CONFIG.GATE_HEIGHT, CONFIG.GATE_DEPTH),
    frameHorizontal: new THREE.BoxGeometry(CONFIG.GATE_WIDTH, 0.15, CONFIG.GATE_DEPTH),
    panel: new THREE.PlaneGeometry(CONFIG.GATE_WIDTH - 0.15 * 2, CONFIG.GATE_HEIGHT - 0.15),
    glow: new THREE.PlaneGeometry(CONFIG.GATE_WIDTH + 1, CONFIG.GATE_HEIGHT + 1),
  },
};

// === CACHE DE TEXTURAS PARA GATES ===
const gateTextureCache = new Map<string, THREE.CanvasTexture>();

export function getGateTexture(label: string, isPositive: boolean): THREE.CanvasTexture {
  const cacheKey = `${label}_${isPositive}`;

  if (gateTextureCache.has(cacheKey)) {
    return gateTextureCache.get(cacheKey)!;
  }

  const canvasWidth = 512;
  const canvasHeight = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;

  // Fondo semi-transparente
  const bgColor = isPositive ? 'rgba(0, 80, 40, 0.7)' : 'rgba(80, 20, 20, 0.7)';
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Marco brillante
  const borderColor = isPositive ? '#00ff66' : '#ff4444';
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
  ctx.fillText(isPositive ? '▲' : '▼', canvasWidth / 2, 140);

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
  ctx.fillText(label, canvasWidth / 2, canvasHeight / 2);
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

  gateTextureCache.set(cacheKey, texture);

  return texture;
}

