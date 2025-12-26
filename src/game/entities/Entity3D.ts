/**
 * ============================================
 * ENTITY3D - Clase base para entidades 3D
 * ============================================
 */

import * as THREE from 'three';

export abstract class Entity3D {
  mesh: THREE.Mesh | THREE.Group;
  active: boolean = true;
  
  constructor(mesh: THREE.Mesh | THREE.Group) {
    this.mesh = mesh;
  }
  
  get position(): THREE.Vector3 {
    return this.mesh.position;
  }
  
  get x(): number { return this.mesh.position.x; }
  set x(value: number) { this.mesh.position.x = value; }
  
  get y(): number { return this.mesh.position.y; }
  set y(value: number) { this.mesh.position.y = value; }
  
  get z(): number { return this.mesh.position.z; }
  set z(value: number) { this.mesh.position.z = value; }
  
  abstract update(dt: number): void;
  
  collidesWith(other: Entity3D, threshold: number): boolean {
    const dx = this.x - other.x;
    const dz = this.z - other.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    return distance < threshold;
  }
  
  boxCollidesWith(
    other: Entity3D, 
    thisSize: number, 
    otherSize: number
  ): boolean {
    const halfThis = thisSize / 2;
    const halfOther = otherSize / 2;
    
    return (
      Math.abs(this.x - other.x) < halfThis + halfOther &&
      Math.abs(this.z - other.z) < halfThis + halfOther
    );
  }
  
  destroy(scene: THREE.Scene | THREE.Group): void {
    scene.remove(this.mesh);
    if (this.mesh instanceof THREE.Mesh) {
      this.mesh.geometry.dispose();
      if (Array.isArray(this.mesh.material)) {
        this.mesh.material.forEach(m => m.dispose());
      } else {
        this.mesh.material.dispose();
      }
    }
  }
}

