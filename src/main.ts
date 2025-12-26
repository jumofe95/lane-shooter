/**
 * ============================================
 * PUNTO DE ENTRADA - Lane Shooter 3D
 * ============================================
 */

import { Game } from './game/Game';

async function main() {
  const container = document.getElementById('game-container');
  const errorDiv = document.getElementById('error');
  const errorMessage = document.getElementById('error-message');
  
  if (!container || !errorDiv || !errorMessage) {
    console.error('No se encontraron elementos del DOM');
    return;
  }
  
  try {
    // Verificar soporte de WebGPU
    if (!navigator.gpu) {
      throw new Error(
        'WebGPU no está soportado en este navegador. ' +
        'Necesitas Chrome 113+, Edge 113+, o Firefox Nightly con WebGPU habilitado.'
      );
    }
    
    console.log('🚀 Inicializando Lane Shooter 3D con WebGPU...');
    
    // Crear y ejecutar el juego
    const game = new Game(container);
    await game.start();
    
    console.log('✅ Juego iniciado correctamente');
    
  } catch (error) {
    console.error('Error:', error);
    
    errorDiv.style.display = 'block';
    errorMessage.textContent = error instanceof Error 
      ? error.message 
      : 'Error desconocido al inicializar el juego';
    
    // Ocultar pantalla de inicio si hay error
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
      startScreen.classList.remove('visible');
    }
  }
}

main();

