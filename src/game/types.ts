/**
 * ============================================
 * TIPOS Y CONFIGURACIÓN DEL JUEGO 3D
 * ============================================
 */

// Tipos de modificadores
export type ModifierType = 
  | 'add_allies'
  | 'remove_allies'
  | 'multiply_allies'
  | 'fire_rate'
  | 'damage'
  | 'piercing';

// Estructura de un modificador
export interface Modifier {
  type: ModifierType;
  value: number;
  label: string;
  isPositive: boolean;
}

// Stats del jugador
export interface PlayerStats {
  numAllies: number;
  fireRate: number;
  damage: number;
  piercing: number;
}

// Configuración del juego
export const CONFIG = {
  // Dimensiones del área de juego
  GAME_WIDTH: 20,
  GAME_DEPTH: 100,
  
  // Carriles
  NUM_LANES: 2,
  get LANE_WIDTH() { return this.GAME_WIDTH / this.NUM_LANES; },
  
  // Jugador
  PLAYER_SIZE: 1,
  PLAYER_SPEED: 15,
  PLAYER_Z: 0,
  
  // Aliados (mismo tamaño que jugador)
  ALLY_SIZE: 0.7,
  ALLY_SPACING: 1.0,
  
  // Enemigos (stickmans grandes) - valores base
  ENEMY_SIZE: 1.5,
  ENEMY_SPEED_BASE: 6,
  ENEMY_HEALTH_BASE: 25,
  ENEMY_SPAWN_Z: -80,
  
  // Boss - valores base
  BOSS_SIZE: 4,
  BOSS_HEALTH_BASE: 300,
  BOSS_SPEED_BASE: 2,
  BOSS_SPAWN_Z: -60,
  
  // Balas
  BULLET_SIZE: 0.3,
  BULLET_SPEED: 50,
  BULLET_ENEMY_SPEED: 25,
  
  // Puertas (ocupan un carril entero)
  get GATE_WIDTH() { return this.LANE_WIDTH * 0.95; },
  GATE_HEIGHT: 6,
  GATE_DEPTH: 0.8,
  GATE_SPAWN_Z: -50,
  GATE_SPEED: 10,
  GATE_SPAWN_MIN: 6,
  GATE_SPAWN_MAX: 10,
  GATE_COUNT_MIN: 2,
  GATE_COUNT_MAX: 2,
  
  // Oleadas - valores base
  WAVE_ENEMY_COUNT_BASE: 3,
  WAVE_SPAWN_INTERVAL_BASE: 3.5,
  WAVES_BEFORE_BOSS: 6,
  
  // Niveles
  MAX_LEVEL: 10,
  
  // Cámara
  CAMERA_HEIGHT: 12,
  CAMERA_DISTANCE: 15,
  CAMERA_LOOK_AHEAD: -10,
};

// Función para calcular dificultad según nivel (1-10)
export function getLevelConfig(level: number) {
  const enemyDifficulty = 1 + (level - 1) * 0.25; // +25% vida por nivel
  
  return {
    // Enemigos más rápidos y con más vida
    enemySpeed: CONFIG.ENEMY_SPEED_BASE * (1 + (level - 1) * 0.12),
    enemyHealth: Math.floor(CONFIG.ENEMY_HEALTH_BASE * enemyDifficulty),
    
    // Más enemigos por oleada - escalado agresivo (+1 por nivel)
    enemiesPerWave: CONFIG.WAVE_ENEMY_COUNT_BASE + (level - 1),
    
    // Oleadas más frecuentes en niveles altos
    waveInterval: Math.max(2, CONFIG.WAVE_SPAWN_INTERVAL_BASE - (level - 1) * 0.2),
    
    // Boss con el doble de vida base y escala agresivamente
    bossHealth: Math.floor(CONFIG.BOSS_HEALTH_BASE * 2 * (1 + (level - 1) * 0.6)),
    bossSpeed: CONFIG.BOSS_SPEED_BASE * (1 + (level - 1) * 0.12),
    
    // Puntos por matar
    enemyValue: 10 + (level - 1) * 5,
    bossValue: 100 + (level - 1) * 50,
  };
}

// Colores del juego (en hex)
export const COLORS = {
  player: 0x00ffff,
  ally: 0x00ff88,
  enemy: 0xff3333,
  boss: 0xff00ff,
  bullet: 0xffff00,
  enemyBullet: 0xff8800,
  gatePositive: 0x00ff66,
  gateNegative: 0xff4444,
  ground: 0x111122,
  lane: 0x1a1a2e,
  ambient: 0x404060,
};

