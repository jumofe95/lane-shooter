/**
 * ============================================
 * SCENE - Configuración de la escena 3D
 * ============================================
 */

import * as THREE from 'three';
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';
import { CONFIG, COLORS } from './types';

export class GameScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: WebGPURenderer;
  
  groundGroup: THREE.Group;
  entityGroup: THREE.Group;
  effectsGroup: THREE.Group;
  
  // Detectar si es móvil para optimizaciones
  static isMobile: boolean = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a15);
    // Fog más cercano en móviles para renderizar menos objetos
    this.scene.fog = new THREE.Fog(0x0a0a15, GameScene.isMobile ? 20 : 30, GameScene.isMobile ? 70 : 100);
    
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      GameScene.isMobile ? 100 : 200
    );
    this.setupCamera();
    
    // Reducir antialias y pixel ratio en móviles
    this.renderer = new WebGPURenderer({ 
      antialias: !GameScene.isMobile 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // Limitar pixel ratio a 1.5 en móviles para mejor rendimiento
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, GameScene.isMobile ? 1.5 : 2));
    container.insertBefore(this.renderer.domElement, container.firstChild);
    
    this.groundGroup = new THREE.Group();
    this.entityGroup = new THREE.Group();
    this.effectsGroup = new THREE.Group();
    
    this.scene.add(this.groundGroup);
    this.scene.add(this.entityGroup);
    this.scene.add(this.effectsGroup);
    
    this.setupLights();
    this.setupGround();
    
    window.addEventListener('resize', this.onResize);
  }
  
  private setupCamera(): void {
    this.camera.position.set(0, CONFIG.CAMERA_HEIGHT, CONFIG.CAMERA_DISTANCE);
    this.camera.lookAt(0, 0, CONFIG.CAMERA_LOOK_AHEAD);
  }
  
  private setupLights(): void {
    const ambient = new THREE.AmbientLight(COLORS.ambient, 0.5);
    this.scene.add(ambient);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 20, 10);
    this.scene.add(mainLight);
    
    const fillLight = new THREE.DirectionalLight(0x4466ff, 0.3);
    fillLight.position.set(0, -5, 20);
    this.scene.add(fillLight);
    
    const playerLight = new THREE.PointLight(0x00ffff, 1, 15);
    playerLight.position.set(0, 3, 0);
    playerLight.name = 'playerLight';
    this.scene.add(playerLight);
  }
  
  private setupGround(): void {
    const groundGeometry = new THREE.PlaneGeometry(
      CONFIG.GAME_WIDTH + 10,
      CONFIG.GAME_DEPTH * 2
    );
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.ground,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.position.z = -CONFIG.GAME_DEPTH / 2;
    this.groundGroup.add(ground);
    
    const lineMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff88,
      transparent: true,
      opacity: 0.3
    });
    
    for (let i = 0; i <= CONFIG.NUM_LANES; i++) {
      const x = -CONFIG.GAME_WIDTH / 2 + i * CONFIG.LANE_WIDTH;
      
      const lineGeometry = new THREE.PlaneGeometry(0.05, CONFIG.GAME_DEPTH * 2);
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, -0.49, -CONFIG.GAME_DEPTH / 2);
      this.groundGroup.add(line);
    }
    
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.1
    });
    
    for (let z = 0; z > -CONFIG.GAME_DEPTH * 2; z -= 5) {
      const gridLine = new THREE.Mesh(
        new THREE.PlaneGeometry(CONFIG.GAME_WIDTH, 0.05),
        gridMaterial
      );
      gridLine.rotation.x = -Math.PI / 2;
      gridLine.position.set(0, -0.48, z);
      this.groundGroup.add(gridLine);
    }
    
    const wallMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide
    });
    
    const wallGeometry = new THREE.PlaneGeometry(CONFIG.GAME_DEPTH * 2, 8);
    
    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-CONFIG.GAME_WIDTH / 2 - 0.5, 3, -CONFIG.GAME_DEPTH / 2);
    this.groundGroup.add(leftWall);
    
    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(CONFIG.GAME_WIDTH / 2 + 0.5, 3, -CONFIG.GAME_DEPTH / 2);
    this.groundGroup.add(rightWall);
  }
  
  updatePlayerLight(x: number, z: number): void {
    const light = this.scene.getObjectByName('playerLight') as THREE.PointLight;
    if (light) {
      light.position.set(x, 3, z);
    }
  }
  
  render(): void {
    this.renderer.render(this.scene, this.camera);
  }
  
  private onResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };
  
  dispose(): void {
    window.removeEventListener('resize', this.onResize);
    (this.renderer as unknown as { dispose?: () => void }).dispose?.();
  }
}

