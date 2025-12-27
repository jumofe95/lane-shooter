/**
 * ============================================
 * INPUT - Manejo de teclado y táctil
 * ============================================
 */

export class Input {
  private keysPressed: Set<string> = new Set();
  private keysJustPressed: Set<string> = new Set();
  
  // Touch - posición del dedo
  private touchX: number = 0;
  private isTouching: boolean = false;
  private touchJustStarted: boolean = false;
  private screenWidth: number = window.innerWidth;
  
  constructor() {
    // Teclado
    window.addEventListener('keydown', (e) => {
      if (!this.keysPressed.has(e.code)) {
        this.keysJustPressed.add(e.code);
      }
      this.keysPressed.add(e.code);
      
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keysPressed.delete(e.code);
    });
    
    window.addEventListener('blur', () => {
      this.keysPressed.clear();
      this.keysJustPressed.clear();
    });
    
    // Touch events - seguir el dedo
    window.addEventListener('touchstart', (e) => {
      this.isTouching = true;
      this.touchJustStarted = true;
      this.touchX = e.touches[0].clientX;
      e.preventDefault();
    }, { passive: false });
    
    window.addEventListener('touchmove', (e) => {
      if (this.isTouching) {
        this.touchX = e.touches[0].clientX;
      }
      e.preventDefault();
    }, { passive: false });
    
    window.addEventListener('touchend', () => {
      this.isTouching = false;
    });
    
    window.addEventListener('touchcancel', () => {
      this.isTouching = false;
    });
    
    // Actualizar ancho de pantalla en resize
    window.addEventListener('resize', () => {
      this.screenWidth = window.innerWidth;
    });
  }
  
  isPressed(code: string): boolean {
    return this.keysPressed.has(code);
  }
  
  isAnyPressed(...codes: string[]): boolean {
    return codes.some(code => this.keysPressed.has(code));
  }
  
  // Detecta si la tecla fue presionada este frame (solo una vez)
  wasJustPressed(code: string): boolean {
    if (this.keysJustPressed.has(code)) {
      this.keysJustPressed.delete(code);
      return true;
    }
    return false;
  }
  
  // Touch: detectar si se tocó la pantalla (para iniciar juego)
  wasTouchStarted(): boolean {
    if (this.touchJustStarted) {
      this.touchJustStarted = false;
      return true;
    }
    return false;
  }
  
  // Touch: obtener posición X normalizada (-1 a 1, donde 0 es el centro)
  getTouchNormalizedX(): number {
    return (this.touchX / this.screenWidth) * 2 - 1;
  }
  
  // Touch: está tocando?
  isTouchActive(): boolean {
    return this.isTouching;
  }
  
  // Limpiar el estado de "just pressed" al final de cada frame
  update(): void {
    this.keysJustPressed.clear();
  }
}
