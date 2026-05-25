# Space Shooter

A fast-paced 2D space shooter built with React, Three.js, and TypeScript. Dodge enemies, collect power-ups, and fight your way through increasingly difficult waves — including epic boss fights.

## How to Play

### Controls

#### Keyboard (Desktop)

```
  [W]          [↑]
  [A][S][D]    [←][↓][→]     — Move your ship
      [SPACE]                 — Fire (hold for continuous)
      [ESC] / [P]             — Pause / Resume
```

#### Touch (Mobile)

```
  [Joystick] ← drag to move   [FIRE] ← tap/hold to shoot
```

### Tutorial

1. **Move** — Use WASD or Arrow keys to steer your ship around the screen. On mobile, drag the on-screen joystick.
2. **Shoot** — Press and hold SPACE to fire at enemies. On mobile, tap and hold the FIRE button.
3. **Survive** — Avoid enemy ships and their bullets. You have 3 lives per run.
4. **Score** — Destroy enemies for points. Chain kills quickly for a combo multiplier (up to 5x).
5. **Power-ups** — Collect glowing orbs that drop from destroyed enemies:
   - 🔵 Spread — fires 5 bullets in a fan
   - 🟢 Rapid — faster fire rate
   - 🟡 Speed — faster movement
   - 🔵 Shield — absorbs one hit
   - 💜 Pierce — bullets pass through enemies
   - 💚 Bounce — bullets bounce off walls
   - 🟠 Coin Magnet — attracts nearby coins
   - ❤️ Extra Life — +1 life (up to 5)
6. **Coins** — Collect golden coins from enemies. Spend them in the Upgrade Shop.
7. **Levels** — The higher your score, the harder the enemies get. Every 5 levels triggers a **boss wave**.
8. **Auto-Fire** — Reach Level 3 or purchase the permanent upgrade to fire automatically!

## Features

- 6 enemy types: Basic, Shooter, Fast, Tank, Swarm, Boss
- 8 power-ups with unique effects
- Combo scoring system (up to 5x multiplier)
- Progressive difficulty with boss waves every 5 levels
- Coin economy with permanent and per-run upgrades
- Persistent leaderboard (powered by Supabase)
- Achievement system
- Touch controls for mobile play
- Auto-fire unlocks at Level 3 (or purchase permanently)
- Bloom lighting and particle effects
- PWA support

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **React 19** — UI framework
- **Three.js** — 3D/2D rendering
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Supabase** — Leaderboard backend
- **PWA** — Offline support

## Project Structure

```
src/
├── components/     # React UI components
│   ├── StartScreen.tsx
│   ├── GameCanvas.tsx
│   ├── HUD.tsx
│   ├── UpgradeShop.tsx
│   ├── GameOverScreen.tsx
│   ├── TouchControls.tsx
│   ├── Leaderboard.tsx
│   └── AchievementsList.tsx
├── game/           # Game engine (Three.js)
│   ├── Game.ts              # Main game loop
│   ├── types.ts             # Types & constants
│   ├── entities/            # Game entities
│   │   ├── Player.ts
│   │   ├── Bullet.ts
│   │   ├── Enemy.ts
│   │   ├── Coin.ts
│   │   └── PowerUp.ts
│   ├── systems/             # Game systems
│   │   ├── InputManager.ts
│   │   ├── CollisionSystem.ts
│   │   ├── SpawnSystem.ts
│   │   ├── ParticleSystem.ts
│   │   └── AudioManager.ts
│   └── render/              # Rendering
│       └── Starfield.ts
├── hooks/          # React hooks
│   └── useGame.ts
├── services/       # Persistence & backend
│   ├── settingsService.ts
│   ├── coinService.ts
│   ├── achievementService.ts
│   └── leaderboardService.ts
└── lib/            # Utilities
    └── supabase.ts
```

Built with ❤️ by **beconwave solutions**
