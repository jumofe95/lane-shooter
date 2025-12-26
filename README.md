# Lane Shooter 3D 🎮

Un juego shooter en carriles 3D construido con **Three.js + WebGPU** y **TypeScript**.

## 🎯 Cómo jugar

- **← → / A D**: Mover al jugador entre carriles
- **Auto-disparo**: Activado automáticamente
- Atraviesa **puertas verdes** para obtener mejoras
- Evita las **puertas rojas** o acepta penalizaciones
- Destruye enemigos antes de que te alcancen
- ¡Derrota al **BOSS** al final!

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## 🛠️ Tecnologías

- **Three.js** con renderer WebGPU
- **TypeScript** para tipado estático
- **Vite** como bundler y servidor de desarrollo

## 📦 Estructura

```
src/
├── main.ts              # Punto de entrada
└── game/
    ├── Game.ts          # Lógica principal
    ├── Scene.ts         # Configuración 3D
    ├── types.ts         # Tipos y configuración
    ├── entities/        # Entidades del juego
    │   ├── Entity3D.ts
    │   ├── Player3D.ts
    │   ├── Ally3D.ts
    │   ├── Enemy3D.ts
    │   ├── Boss3D.ts
    │   ├── Bullet3D.ts
    │   └── Gate3D.ts
    └── systems/         # Sistemas del juego
        ├── Input.ts
        ├── WaveSpawner.ts
        ├── GateSpawner.ts
        └── FormationManager.ts
```

## 🎮 Mecánicas

### Modificadores disponibles

**Positivos (Puertas Verdes):**
- `+N Aliados` - Añade aliados que disparan
- `+Cadencia` - Aumenta velocidad de disparo
- `+Daño` - Aumenta daño por bala
- `+Piercing` - Las balas atraviesan más enemigos

**Negativos (Puertas Rojas):**
- `-N Aliado` - Pierde aliados
- `-Cadencia` - Reduce velocidad de disparo
- `-Daño` - Reduce daño por bala

## ⚠️ Requisitos

- Navegador con soporte **WebGPU**:
  - Chrome 113+
  - Edge 113+
  - Firefox Nightly (con flag habilitado)

