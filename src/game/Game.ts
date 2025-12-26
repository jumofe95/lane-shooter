/**
 * ============================================
 * GAME - Lógica principal del juego 3D
 * ============================================
 */

import * as THREE from 'three';
import { GameScene } from './Scene';
import { Player3D } from './entities/Player3D';
import { Ally3D } from './entities/Ally3D';
import { Enemy3D } from './entities/Enemy3D';
import { Boss3D } from './entities/Boss3D';
import { Bullet3D } from './entities/Bullet3D';
import { Gate3D } from './entities/Gate3D';
import { WaveSpawner } from './systems/WaveSpawner';
import { GateSpawner } from './systems/GateSpawner';
import { FormationManager } from './systems/FormationManager';
import { Input } from './systems/Input';
import { CONFIG } from './types';

type GameState = 'start' | 'playing' | 'gameover' | 'victory';

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
  
  private waveSpawner: WaveSpawner;
  private gateSpawner: GateSpawner;
  private formationManager: FormationManager;
  
  private state: GameState = 'start';
  private score: number = 0;
  private lastTime: number = 0;
  
  // UI Elements
  private scoreEl!: HTMLElement;
  private alliesEl!: HTMLElement;
  private damageEl!: HTMLElement;
  private firerateEl!: HTMLElement;
  private piercingEl!: HTMLElement;
  private waveEl!: HTMLElement;
  private bossHealthEl!: HTMLElement;
  private bossBarEl!: HTMLElement;
  private startScreenEl!: HTMLElement;
  private gameoverScreenEl!: HTMLElement;
  private victoryScreenEl!: HTMLElement;
  private finalScoreEl!: HTMLElement;
  private victoryScoreEl!: HTMLElement;
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
    this.bossHealthEl = document.getElementById('boss-health')!;
    this.bossBarEl = document.getElementById('boss-bar')!;
    this.startScreenEl = document.getElementById('start-screen')!;
    this.gameoverScreenEl = document.getElementById('gameover-screen')!;
    this.victoryScreenEl = document.getElementById('victory-screen')!;
    this.finalScoreEl = document.getElementById('final-score')!;
    this.victoryScoreEl = document.getElementById('victory-score')!;
    this.playerHealthBarEl = document.getElementById('player-health-bar')!;
  }
  
  async start(): Promise<void> {
    this.scene = new GameScene(this.container);
    
    await this.scene.renderer.init();
    
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
    
    // Reset sistemas
    this.waveSpawner.reset();
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
  
  private gameLoop = (time: number): void => {
    requestAnimationFrame(this.gameLoop);
    
    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
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
    
    // Input de movimiento (táctil/swipe)
    const swipeDir = this.input.getSwipeDirection();
    if (swipeDir !== 0) {
      this.player.move(swipeDir, dt);
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
    
    // Spawn de enemigos
    if (!this.boss && !this.waveSpawner.isBossTime) {
      const newEnemies = this.waveSpawner.update(dt, this.scene.entityGroup);
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
    
    // Actualizar boss
    if (this.boss) {
      this.boss.update(dt);
      this.bossBarEl.style.width = `${this.boss.healthPercent * 100}%`;
    }
    
    // Spawn de puertas
    const hasActiveGates = this.gates.length > 0;
    const newGates = this.gateSpawner.update(dt, hasActiveGates, this.scene.entityGroup);
    this.gates.push(...newGates);
    
    // Actualizar puertas
    for (const gate of this.gates) {
      gate.update(dt);
    }
    this.gates = this.gates.filter(g => g.active);
    
    // Colisiones
    this.checkCollisions();
    
    // Actualizar formación de aliados
    this.formationManager.updatePositions(this.allies, this.player);
    
    // Limpiar balas inactivas de la escena
    for (const bullet of this.bullets) {
      if (!bullet.active) {
        bullet.destroy(this.scene.entityGroup);
      }
    }
    this.bullets = this.bullets.filter(b => b.active);
    
    // Limpiar enemigos inactivos
    for (const enemy of [...this.enemies]) {
      if (!enemy.active) {
        enemy.destroy(this.scene.entityGroup);
      }
    }
    this.enemies = this.enemies.filter(e => e.active);
    
    // Limpiar puertas inactivas
    for (const gate of [...this.gates]) {
      if (!gate.active) {
        gate.destroy(this.scene.entityGroup);
      }
    }
    this.gates = this.gates.filter(g => g.active);
    
    this.updateUI();
  }
  
  private checkCollisions(): void {
    // Balas vs Enemigos
    for (const bullet of this.bullets) {
      if (!bullet.active || !bullet.isPlayerBullet) continue;
      
      for (const enemy of this.enemies) {
        if (!enemy.active) continue;
        
        if (bullet.collidesWith(enemy, CONFIG.ENEMY_SIZE)) {
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
        if (bullet.collidesWith(this.boss, CONFIG.BOSS_SIZE)) {
          const killed = this.boss.takeDamage(bullet.damage);
          bullet.onHit();
          
          if (killed) {
            this.score += this.boss.value;
            this.victory();
          }
        }
      }
    }
    
    // Jugador vs Puertas
    for (const gate of this.gates) {
      if (!gate.active) continue;
      
      const playerLane = this.getLane(this.player.x);
      
      if (gate.lane === playerLane && Math.abs(gate.z - this.player.z) < 1.5) {
        this.player.applyModifier(gate.modifier.type, gate.modifier.value);
        
        console.log(`🚪 ${gate.modifier.label}`);
        
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
    this.boss = new Boss3D();
    this.scene.entityGroup.add(this.boss.mesh);
    this.bossHealthEl.classList.add('visible');
    this.waveSpawner.pause();
    
    console.log('👹 ¡BOSS APARECIÓ!');
  }
  
  private updateUI(): void {
    this.scoreEl.textContent = this.score.toString();
    this.alliesEl.textContent = this.player.stats.numAllies.toString();
    this.damageEl.textContent = this.player.stats.damage.toString();
    this.firerateEl.textContent = this.player.stats.fireRate.toFixed(1);
    this.piercingEl.textContent = this.player.stats.piercing.toString();
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
  
  private victory(): void {
    this.state = 'victory';
    this.victoryScoreEl.textContent = this.score.toString();
    this.victoryScreenEl.classList.add('visible');
    this.bossHealthEl.classList.remove('visible');
    
    console.log('🏆 ¡VICTORIA! - Puntuación:', this.score);
  }
}

