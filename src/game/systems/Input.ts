/**
 * ============================================
 * INPUT - Manejo de teclado y táctil
 * ============================================
 */

export class Input {
  private keysPressed: Set<string> = new Set();
  private keysJustPressed: Set<string> = new Set();
  
  // Touch/Swipe
  private touchStartX: number = 0;
  private touchCurrentX: number = 0;
  private isTouching: boolean = false;
  private touchJustStarted: boolean = false;
  private swipeDirection: number = 0; // -1 izquierda, 0 nada, 1 derecha
  
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
    
    // Touch events
    window.addEventListener('touchstart', (e) => {
      this.isTouching = true;
      this.touchJustStarted = true;
      this.touchStartX = e.touches[0].clientX;
      this.touchCurrentX = e.touches[0].clientX;
      e.preventDefault();
    }, { passive: false });
    
    window.addEventListener('touchmove', (e) => {
      if (this.isTouching) {
        this.touchCurrentX = e.touches[0].clientX;
        
        // Calcular dirección del swipe basado en la posición relativa al inicio
        const deltaX = this.touchCurrentX - this.touchStartX;
        const threshold = 10; // Umbral mínimo para detectar movimiento
        
        if (deltaX < -threshold) {
          this.swipeDirection = -1; // Izquierda
        } else if (deltaX > threshold) {
          this.swipeDirection = 1; // Derecha
        } else {
          this.swipeDirection = 0;
        }
      }
      e.preventDefault();
    }, { passive: false });
    
    window.addEventListener('touchend', () => {
      this.isTouching = false;
      this.swipeDirection = 0;
      this.touchStartX = 0;
      this.touchCurrentX = 0;
    });
    
    window.addEventListener('touchcancel', () => {
      this.isTouching = false;
      this.swipeDirection = 0;
      this.touchStartX = 0;
      this.touchCurrentX = 0;
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
  
  // Touch: obtener dirección del swipe (-1, 0, 1)
  getSwipeDirection(): number {
    return this.swipeDirection;
  }
  
  // Touch: está tocando?
  getTouching(): boolean {
    return this.isTouching;
  }
  
  // Limpiar el estado de "just pressed" al final de cada frame
  update(): void {
    this.keysJustPressed.clear();
  }
}
