/**
 * ============================================
 * INPUT - Manejo de teclado
 * ============================================
 */

export class Input {
  private keysPressed: Set<string> = new Set();
  private keysJustPressed: Set<string> = new Set();
  
  constructor() {
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
  
  // Limpiar el estado de "just pressed" al final de cada frame
  update(): void {
    this.keysJustPressed.clear();
  }
}
