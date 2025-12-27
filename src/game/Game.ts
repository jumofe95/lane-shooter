/**
 * ============================================
 * GAME - Lógica principal del juego 3D (Optimizado)
 * ============================================
 */

import * as THREE from 'three';
import { GameScene } from './Scene';
import { Player3D } from './entities/Player3D';
import { Ally3D } from './entities/Ally3D';
import { Enemy3D } from './entities/Enemy3D';
import { Boss3D } from './entities/Boss3D';
import { BossProjectile } from './entities/BossProjectile';
import { Bullet3D } from './entities/Bullet3D';
import { Gate3D } from './entities/Gate3D';
import { WaveSpawner } from './systems/WaveSpawner';
import { GateSpawner } from './systems/GateSpawner';
import { FormationManager } from './systems/FormationManager';
import { Input } from './systems/Input';
import { bulletPool, enemyPool } from './systems/ObjectPool';
import { CONFIG, getLevelConfig } from './types';

type GameState = 'start' | 'playing' | 'gameover' | 'victory' | 'levelComplete';

export class Game {
  private container: HTMLElement;
  private scene!: GameScene;
  private input: Input;
  
  private player!: Player3D;
  private allies: Ally3D[] = [];
  private enemies: Enemy3D[] = [];
  private bullets: Bullet3D[] = [];
  private gates: Gate3D[] = [];
  private boss: Boss3D | null = null;
  private bossProjectiles: BossProjectile[] = [];
  
  private waveSpawner: WaveSpawner;
  private gateSpawner: GateSpawner;
  private formationManager: FormationManager;
  
  private state: GameState = 'start';
  private score: number = 0;
  private lastTime: number = 0;
  private currentLevel: number = 1;
  
  // UI Elements
  private scoreEl!: HTMLElement;
  private alliesEl!: HTMLElement;
  private damageEl!: HTMLElement;
  private firerateEl!: HTMLElement;
  private piercingEl!: HTMLElement;
  private waveEl!: HTMLElement;
  private levelEl!: HTMLElement;
  private bossHealthEl!: HTMLElement;
  private bossBarEl!: HTMLElement;
  private startScreenEl!: HTMLElement;
  private gameoverScreenEl!: HTMLElement;
  private victoryScreenEl!: HTMLElement;
  private levelCompleteScreenEl!: HTMLElement;
  private finalScoreEl!: HTMLElement;
  private victoryScoreEl!: HTMLElement;
  private nextLevelEl!: HTMLElement;
  private playerHealthBarEl!: HTMLElement;
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.input = new Input();
    this.waveSpawner = new WaveSpawner();
    this.gateSpawner = new GateSpawner();
    this.formationManager = new FormationManager();
    
    this.initUI();
  }
  
  private initUI(): void {
    this.scoreEl = document.getElementById('score')!;
    this.alliesEl = document.getElementById('allies')!;
    this.damageEl = document.getElementById('damage')!;
    this.firerateEl = document.getElementById('firerate')!;
    this.piercingEl = document.getElementById('piercing')!;
    this.waveEl = document.getElementById('wave')!;
    this.levelEl = document.getElementById('level')!;
    this.bossHealthEl = document.getElementById('boss-health')!;
    this.bossBarEl = document.getElementById('boss-bar')!;
    this.startScreenEl = document.getElementById('start-screen')!;
    this.gameoverScreenEl = document.getElementById('gameover-screen')!;
    this.victoryScreenEl = document.getElementById('victory-screen')!;
    this.levelCompleteScreenEl = document.getElementById('level-complete-screen')!;
    this.finalScoreEl = document.getElementById('final-score')!;
    this.victoryScoreEl = document.getElementById('victory-score')!;
    this.nextLevelEl = document.getElementById('next-level')!;
    this.playerHealthBarEl = document.getElementById('player-health-bar')!;
    
    // Admin panel (solo desktop)
    this.initAdminPanel();
  }
  
  private initAdminPanel(): void {
    const adminBtn = document.getElementById('admin-btn');
    const statsPanel = document.getElementById('stats-panel');
    const applyBtn = document.getElementById('admin-apply');
    
    if (!adminBtn || !statsPanel || !applyBtn) return;
    
    // Toggle admin mode
    adminBtn.addEventListener('click', () => {
      // Solo funciona si el juego está activo
      if (this.state !== 'playing' || !this.player) {
        return;
      }
      
      statsPanel.classList.toggle('admin-mode');
      adminBtn.classList.toggle('active');
      
      // Actualizar inputs con valores actuales
      if (statsPanel.classList.contains('admin-mode')) {
        (document.getElementById('score-input') as HTMLInputElement).value = this.score.toString();
        (document.getElementById('allies-input') as HTMLInputElement).value = this.player.stats.numAllies.toString();
        (document.getElementById('damage-input') as HTMLInputElement).value = this.player.stats.damage.toString();
        (document.getElementById('firerate-input') as HTMLInputElement).value = this.player.stats.fireRate.toString();
        (document.getElementById('piercing-input') as HTMLInputElement).value = this.player.stats.piercing.toString();
      }
    });
    
    // Aplicar cambios
    applyBtn.addEventListener('click', () => {
      if (!this.player) return;
      this.applyAdminChanges();
      statsPanel.classList.remove('admin-mode');
      adminBtn.classList.remove('active');
    });
  }
  
  private applyAdminChanges(): void {
    if (!this.player) return;
    
    // Obtener valores de los inputs
    const newScore = parseInt((document.getElementById('score-input') as HTMLInputElement).value) || 0;
    const newAllies = parseInt((document.getElementById('allies-input') as HTMLInputElement).value) || 0;
    const newDamage = parseInt((document.getElementById('damage-input') as HTMLInputElement).value) || 1;
    const newFireRate = parseFloat((document.getElementById('firerate-input') as HTMLInputElement).value) || 1;
    const newPiercing = parseInt((document.getElementById('piercing-input') as HTMLInputElement).value) || 1;
    
    // Aplicar cambios
    this.score = newScore;
    this.player.stats.numAllies = Math.max(0, newAllies);
    this.player.stats.damage = Math.max(1, newDamage);
    this.player.stats.fireRate = Math.max(0.5, newFireRate);
    this.player.stats.piercing = Math.max(1, newPiercing);
    
    // Actualizar aliados
    this.allies = this.formationManager.updateAllies(
      this.allies,
      this.player,
      this.scene.entityGroup
    );
    
    // Actualizar UI
    this.updateUI();
    
    console.log('🔧 Admin: Stats aplicados', {
      score: this.score,
      allies: this.player.stats.numAllies,
      damage: this.player.stats.damage,
      fireRate: this.player.stats.fireRate,
      piercing: this.player.stats.piercing
    });
  }
  
  async start(): Promise<void> {
    this.scene = new GameScene(this.container);

    await this.scene.renderer.init();

    // Inicializar pools
    bulletPool.setScene(this.scene.entityGroup);
    bulletPool.prewarm(50);
    enemyPool.setScene(this.scene.entityGroup);

    this.initGame();
    this.gameLoop(0);
  }
  
  private initGame(): void {
    // Limpiar jugador anterior
    if (this.player) {
      this.scene.entityGroup.remove(this.player.mesh);
    }
    
    // Limpiar entidades anteriores
    for (const enemy of this.enemies) {
      this.scene.entityGroup.remove(enemy.mesh);
    }
    for (const ally of this.allies) {
      this.scene.entityGroup.remove(ally.mesh);
    }
    for (const bullet of this.bullets) {
      this.scene.entityGroup.remove(bullet.mesh);
    }
    for (const gate of this.gates) {
      this.scene.entityGroup.remove(gate.mesh);
    }
    if (this.boss) {
      this.scene.entityGroup.remove(this.boss.mesh);
      this.boss = null;
    }
    for (const proj of this.bossProjectiles) {
      this.scene.entityGroup.remove(proj.mesh);
    }
    this.bossProjectiles = [];
    
    // Limpiar todo el grupo de entidades por si quedó algo
    while (this.scene.entityGroup.children.length > 0) {
      this.scene.entityGroup.remove(this.scene.entityGroup.children[0]);
    }
    
    // Crear jugador
    this.player = new Player3D();
    this.scene.entityGroup.add(this.player.mesh);
    
    // Reset
    this.allies = [];
    this.enemies = [];
    this.bullets = [];
    this.gates = [];
    this.score = 0;
    this.currentLevel = 1;
    
    // Reset sistemas
    this.waveSpawner.reset();
    this.waveSpawner.setLevel(this.currentLevel);
    this.gateSpawner.reset();
    
    // Actualizar formación inicial (0 aliados)
    this.allies = this.formationManager.updateAllies(
      this.allies,
      this.player,
      this.scene.entityGroup
    );
    
    this.updateUI();
    this.updatePlayerHealthBar();
  }
  
  private clearLevelEntities(): void {
    // Limpiar enemigos, balas, puertas y boss del nivel actual
    for (const enemy of this.enemies) {
      this.scene.entityGroup.remove(enemy.mesh);
    }
    for (const bullet of this.bullets) {
      this.scene.entityGroup.remove(bullet.mesh);
    }
    for (const gate of this.gates) {
      this.scene.entityGroup.remove(gate.mesh);
    }
    if (this.boss) {
      this.scene.entityGroup.remove(this.boss.mesh);
      this.boss = null;
    }
    for (const proj of this.bossProjectiles) {
      this.scene.entityGroup.remove(proj.mesh);
    }
    
    this.enemies = [];
    this.bullets = [];
    this.gates = [];
    this.bossProjectiles = [];
  }
  
  private startNextLevel(): void {
    this.currentLevel++;
    this.levelCompleteScreenEl.classList.remove('visible');
    this.bossHealthEl.classList.remove('visible');
    
    // Limpiar entidades del nivel anterior
    this.clearLevelEntities();
    
    // Regenerar solo 30% de la vida (no resetear completamente)
    const healthRegen = this.player.maxHealth * 0.30;
    this.player.health = Math.min(this.player.maxHealth, this.player.health + healthRegen);
    this.updatePlayerHealthBar();
    
    // Resetear spawners para el nuevo nivel
    this.waveSpawner.resetForNewLevel();
    this.waveSpawner.setLevel(this.currentLevel);
    this.gateSpawner.reset();
    
    this.state = 'playing';
    this.updateUI();
    
    console.log(`🎮 ¡Comenzando Nivel ${this.currentLevel}! Vida: ${Math.floor(this.player.health)}/${this.player.maxHealth}`);
  }
  
  private gameLoop = (time: number): void => {
    requestAnimationFrame(this.gameLoop);
    
    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
    
    // Limitar a ~30 FPS en móviles para mejor rendimiento
    if (GameScene.isMobile && dt < 0.028) {
      return; // Skip frame si es demasiado pronto
    }
    
    this.lastTime = time;
    
    this.handleInput();
    
    if (this.state === 'playing') {
      this.update(dt);
    }
    
    this.scene.render();
  };
  
  private handleInput(): void {
    // Teclado o Touch para iniciar/reiniciar
    if (this.input.wasJustPressed('Space') || this.input.wasTouchStarted()) {
      if (this.state === 'start') {
        this.startGame();
      } else if (this.state === 'gameover' || this.state === 'victory') {
        this.restartGame();
      } else if (this.state === 'levelComplete') {
        this.startNextLevel();
      }
    }
  }
  
  private startGame(): void {
    this.state = 'playing';
    this.startScreenEl.classList.remove('visible');
  }
  
  private restartGame(): void {
    this.gameoverScreenEl.classList.remove('visible');
    this.victoryScreenEl.classList.remove('visible');
    this.bossHealthEl.classList.remove('visible');
    
    this.initGame();
    this.state = 'playing';
  }
  
  private update(dt: number): void {
    // Input de movimiento (teclado)
    if (this.input.isAnyPressed('ArrowLeft', 'KeyA')) {
      this.player.move(-1, dt);
    }
    if (this.input.isAnyPressed('ArrowRight', 'KeyD')) {
      this.player.move(1, dt);
    }
    
    // Input de movimiento (táctil - seguir el dedo)
    if (this.input.isTouchActive()) {
      const touchNormX = this.input.getTouchNormalizedX();
      const targetX = touchNormX * (CONFIG.GAME_WIDTH / 2 - CONFIG.PLAYER_SIZE);
      this.player.setTargetX(targetX);
    }
    
    // Actualizar jugador
    this.player.update(dt);
    this.scene.updatePlayerLight(this.player.x, this.player.z);
    
    // Auto-disparo del jugador
    const playerBullet = this.player.tryShoot(this.scene.entityGroup);
    if (playerBullet) {
      this.bullets.push(playerBullet);
    }
    
    // Actualizar y disparar aliados
    for (const ally of this.allies) {
      ally.update(dt);
      const allyBullet = ally.tryShoot(this.player, this.scene.entityGroup);
      if (allyBullet) {
        this.bullets.push(allyBullet);
      }
    }
    
    // Actualizar balas
    for (const bullet of this.bullets) {
      bullet.update(dt);
    }
    this.bullets = this.bullets.filter(b => b.active);
    
    // Spawn de enemigos (cantidad escala con aliados)
    if (!this.boss && !this.waveSpawner.isBossTime) {
      const newEnemies = this.waveSpawner.update(dt, this.scene.entityGroup, this.player.stats.numAllies);
      this.enemies.push(...newEnemies);
      
      if (newEnemies.length > 0) {
        this.waveEl.textContent = this.waveSpawner.wave.toString();
      }
    }
    
    // Spawn del boss
    if (!this.boss && this.waveSpawner.isBossTime && this.enemies.length === 0) {
      this.spawnBoss();
    }
    
    // Actualizar enemigos
    for (const enemy of this.enemies) {
      enemy.update(dt);
      
      // Verificar si el enemigo llegó al final
      if (enemy.reachedEnd && enemy.active) {
        enemy.active = false;
        const isDead = this.player.takeDamage(15);
        this.updatePlayerHealthBar();
        
        if (isDead) {
          this.gameOver();
          return;
        }
      }
    }
    this.enemies = this.enemies.filter(e => e.active);
    
    // Actualizar boss y sus ataques
    if (this.boss) {
      this.boss.update(dt);
      this.bossBarEl.style.width = `${this.boss.healthPercent * 100}%`;
      
      // Actualizar ataques especiales del boss
      const newProjectiles = this.boss.updateAttack(dt, this.player.x);
      for (const proj of newProjectiles) {
        this.scene.entityGroup.add(proj.mesh);
        this.bossProjectiles.push(proj);
      }
    }
    
    // Actualizar proyectiles del boss
    for (const proj of this.bossProjectiles) {
      proj.update(dt);
      
      // Verificar colisión con jugador
      if (proj.checkPlayerCollision(this.player.x, this.player.z)) {
        this.player.takeDamage(proj.damage);
        proj.active = false;
        this.updatePlayerHealthBar();
        
        if (this.player.health <= 0) {
          this.gameOver();
          return;
        }
      }
    }
    
    // Limpiar proyectiles inactivos
    this.bossProjectiles = this.bossProjectiles.filter(proj => {
      if (!proj.active) {
        this.scene.entityGroup.remove(proj.mesh);
        return false;
      }
      return true;
    });
    
    // Spawn de puertas
    const hasActiveGates = this.gates.length > 0;
    const newGates = this.gateSpawner.update(dt, hasActiveGates, this.scene.entityGroup);
    this.gates.push(...newGates);
    
    // Actualizar puertas
    for (const gate of this.gates) {
      gate.update(dt);
    }

    // Colisiones optimizadas
    this.checkCollisionsOptimized();

    // Actualizar formación de aliados
    this.formationManager.updatePositions(this.allies, this.player);

    // Cleanup consolidado - un solo loop por tipo
    this.cleanupInactiveEntities();

    this.updateUI();
  }

  // Cleanup consolidado para mejor rendimiento
  private cleanupInactiveEntities(): void {
    // Bullets - usar pool para retornar
    let bulletWriteIdx = 0;
    for (let i = 0; i < this.bullets.length; i++) {
      const bullet = this.bullets[i];
      if (bullet.active) {
        this.bullets[bulletWriteIdx++] = bullet;
      } else {
        bulletPool.release(bullet);
      }
    }
    this.bullets.length = bulletWriteIdx;

    // Enemies - usar pool para retornar
    let enemyWriteIdx = 0;
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      if (enemy.active) {
        this.enemies[enemyWriteIdx++] = enemy;
      } else {
        enemyPool.release(enemy);
      }
    }
    this.enemies.length = enemyWriteIdx;

    // Gates - no hay pool, solo remover de escena
    let gateWriteIdx = 0;
    for (let i = 0; i < this.gates.length; i++) {
      const gate = this.gates[i];
      if (gate.active) {
        this.gates[gateWriteIdx++] = gate;
      } else {
        gate.destroy(this.scene.entityGroup);
      }
    }
    this.gates.length = gateWriteIdx;
  }

  // Detección de colisiones optimizada con early-out
  private checkCollisionsOptimized(): void {
    const enemySize = CONFIG.ENEMY_SIZE;
    const bossSize = CONFIG.BOSS_SIZE;

    // Pre-filtrar balas activas del jugador
    for (let bi = 0; bi < this.bullets.length; bi++) {
      const bullet = this.bullets[bi];
      if (!bullet.active || !bullet.isPlayerBullet) continue;

      const bulletX = bullet.x;
      const bulletZ = bullet.z;

      // Balas vs Enemigos - con early-out por distancia Z
      for (let ei = 0; ei < this.enemies.length; ei++) {
        const enemy = this.enemies[ei];
        if (!enemy.active) continue;

        // Early-out: si la bala está muy lejos en Z, skip
        const dz = bulletZ - enemy.z;
        if (dz > enemySize || dz < -enemySize) continue;

        // Check X distance
        const dx = bulletX - enemy.x;
        if (dx > enemySize || dx < -enemySize) continue;

        // Full collision check
        if (bullet.collidesWith(enemy, enemySize)) {
          const killed = enemy.takeDamage(bullet.damage);
          bullet.onHit();

          if (killed) {
            this.score += enemy.value;
          }

          if (!bullet.active) break;
        }
      }

      // Balas vs Boss
      if (this.boss && this.boss.active && bullet.active) {
        if (bullet.collidesWith(this.boss, bossSize)) {
          const killed = this.boss.takeDamage(bullet.damage);
          bullet.onHit();

          if (killed) {
            this.score += this.boss.value;

            if (this.currentLevel >= CONFIG.MAX_LEVEL) {
              this.victory();
            } else {
              this.levelComplete();
            }
          }
        }
      }
    }

    // Jugador vs Puertas
    const playerLane = this.getLane(this.player.x);
    const playerZ = this.player.z;

    for (let gi = 0; gi < this.gates.length; gi++) {
      const gate = this.gates[gi];
      if (!gate.active) continue;

      if (gate.lane === playerLane && Math.abs(gate.z - playerZ) < 1.5) {
        this.player.applyModifier(gate.modifier.type, gate.modifier.value);

        // Actualizar aliados según el nuevo número
        this.allies = this.formationManager.updateAllies(
          this.allies,
          this.player,
          this.scene.entityGroup
        );

        gate.active = false;
      }
    }
  }
  
  private getLane(x: number): number {
    const normalizedX = x + CONFIG.GAME_WIDTH / 2;
    return Math.floor(normalizedX / CONFIG.LANE_WIDTH);
  }
  
  private spawnBoss(): void {
    const levelConfig = getLevelConfig(this.currentLevel);
    
    this.boss = new Boss3D(
      levelConfig.bossHealth,
      levelConfig.bossSpeed,
      levelConfig.bossValue,
      this.currentLevel
    );
    this.scene.entityGroup.add(this.boss.mesh);
    this.bossHealthEl.classList.add('visible');
    this.waveSpawner.pause();
    
    console.log(`👹 ¡BOSS del Nivel ${this.currentLevel} APARECIÓ! Ataque: ${this.boss.getAttackName()}`);
  }
  
  private updateUI(): void {
    this.scoreEl.textContent = this.score.toString();
    this.alliesEl.textContent = this.player.stats.numAllies.toString();
    this.damageEl.textContent = this.player.stats.damage.toString();
    this.firerateEl.textContent = this.player.stats.fireRate.toFixed(1);
    this.piercingEl.textContent = this.player.stats.piercing.toString();
    this.levelEl.textContent = this.currentLevel.toString();
  }
  
  private updatePlayerHealthBar(): void {
    const percent = this.player.healthPercent;
    this.playerHealthBarEl.style.width = `${percent * 100}%`;
    
    this.playerHealthBarEl.classList.remove('medium', 'low');
    if (percent <= 0.25) {
      this.playerHealthBarEl.classList.add('low');
    } else if (percent <= 0.5) {
      this.playerHealthBarEl.classList.add('medium');
    }
  }
  
  private gameOver(): void {
    this.state = 'gameover';
    this.finalScoreEl.textContent = this.score.toString();
    this.gameoverScreenEl.classList.add('visible');
    
    console.log('💀 GAME OVER - Puntuación:', this.score);
  }
  
  private levelComplete(): void {
    this.state = 'levelComplete';
    this.nextLevelEl.textContent = (this.currentLevel + 1).toString();
    this.levelCompleteScreenEl.classList.add('visible');
    this.bossHealthEl.classList.remove('visible');
    
    console.log(`✅ ¡Nivel ${this.currentLevel} Completado! - Puntuación: ${this.score}`);
  }
  
  private victory(): void {
    this.state = 'victory';
    this.victoryScoreEl.textContent = this.score.toString();
    this.victoryScreenEl.classList.add('visible');
    this.bossHealthEl.classList.remove('visible');
    
    console.log('🏆 ¡VICTORIA TOTAL! - Puntuación:', this.score);
  }
}

