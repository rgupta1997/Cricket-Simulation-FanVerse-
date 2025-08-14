# Cricket Simulation - 3D Stadium Environment

A modular React application built with Vite and Three.js that creates an immersive cricket simulation environment with multiple camera views and real-time 3D rendering.

## Features

- **🏏 Full Cricket Simulation Game**: Complete cricket match simulation with all player roles
- **👥 Realistic Player System**: Striker, non-striker, bowler, wicket keeper, and two umpires
- **⚾ Advanced Ball Physics**: Realistic ball trajectory, bounce, and throwing mechanics
- **🎮 Interactive Game Controls**: Full batting, bowling, and fielding control system
- **🏟️ 3D Cricket Stadium**: Fully rendered cricket ground with pitch, boundary, wickets, and seating
- **📹 Multi-Camera System**: 6 different camera views (Umpire, Top, Bird Eye, Left, Right, Center)
- **💡 Dynamic Lighting**: Stadium flood lights with adjustable intensity
- **🎯 Intelligent Fielding**: Automatic fielder positioning and ball collection
- **📊 Score Tracking**: Real-time score, wickets, and overs tracking
- **🎨 Smooth Animations**: Professional player animations for all cricket actions
- **⌨️ Comprehensive Controls**: Intuitive keyboard controls for all game aspects
- **🔧 Functional Programming**: Built with pure functions and reusable components
- **📐 Modular Architecture**: Clean separation of concerns with organized folder structure

## Camera Views

| Key | View Name | Description |
|-----|-----------|-------------|
| 1 | Umpire View | Behind the wickets perspective |
| 2 | Top View | Directly above the pitch |
| 3 | Bird Eye View | Elevated diagonal view |
| 4 | Left View | Side view from left |
| 5 | Right View | Side view from right |
| 6 | Center View | Centered elevated view |

## 🏏 Cricket Simulation Game Controls

### Bowling Controls
| Key | Action | Description |
|-----|--------|-------------|
| **SPACEBAR** | Bowl | Release the ball towards the batsman |
| **1** | Bowling Mode | Switch to bowling control mode |

### Batting Controls
| Key | Action | Description |
|-----|--------|-------------|
| **D** | Defensive Shot | Play a defensive stroke |
| **F** | Drive Shot | Play a drive shot |
| **G** | Pull Shot | Play a pull shot |
| **H** | Cut Shot | Play a cut shot |
| **V** | Loft Shot | Play a lofted shot |
| **2** | Batting Mode | Switch to batting control mode |

### Fielding Controls
| Key | Action | Description |
|-----|--------|-------------|
| **T** | Throw to Keeper | Throw the ball back to wicket keeper |
| **3** | Fielding Mode | Switch to fielding control mode |

### General Game Controls
| Key | Action | Description |
|-----|--------|-------------|
| **P** | Pause/Resume | Pause or resume the game |
| **C** | Stadium Toggle | Switch between basic and 3D stadium model |

## 🎮 How to Play

1. **Start the Game**: The game begins with the bowler ready to bowl
2. **Bowl the Ball**: Press `SPACEBAR` to bowl the ball towards the batsman
3. **Bat the Ball**: When the ball approaches, press batting keys (`D`, `F`, `G`, `H`, `V`) to play different shots
4. **Field the Ball**: When the ball is hit, nearest fielders automatically move to collect it
5. **Return the Ball**: Press `T` to throw the ball back to the wicket keeper
6. **Track Progress**: Watch the score, wickets, and overs displayed on screen

## 👥 Player Positions

- **Striker**: The batsman on strike (positioned at striker's end)
- **Non-Striker**: The batsman at the other end
- **Bowler**: Positioned at the bowling crease
- **Wicket Keeper**: Behind the striker's wickets
- **Bowler's End Umpire**: Positioned behind the bowler's wickets
- **Point Umpire**: Positioned at point for right-handed batsman
- **Fielders**: 10 fielders positioned around the ground in standard cricket positions

## Project Structure

```
src/
├── components/          # React components
│   ├── Stadium.jsx     # Main stadium with field, pitch, wickets
│   ├── Lighting.jsx    # Stadium lighting system
│   ├── Camera.jsx      # Camera component with smooth transitions
│   └── UI.jsx          # User interface overlays
├── hooks/              # Custom React hooks
│   └── useCameraControls.js  # Camera view management
├── utils/              # Utility functions
│   ├── dataPoints.js   # Cricket simulation data calculations
│   └── animations.js   # Animation and easing functions
└── constants/          # Configuration constants
    └── cameraViews.js  # Camera positions and stadium config
```

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Technical Architecture

### Functional Programming Principles

- **Pure Functions**: All utility functions are pure with no side effects
- **Immutable Data**: State updates use immutable patterns
- **Component Composition**: Reusable components with clear interfaces
- **Separation of Concerns**: Logic separated from presentation

### Key Components

#### Stadium Component
- Modular sub-components (Field, Pitch, Wickets, Seating)
- Configurable dimensions and materials
- Optimized geometry for performance

#### Camera System
- Smooth transitions between views
- Configurable transition speed
- Automatic FOV adjustment

#### Lighting System
- Multiple flood light towers
- Dynamic shadows
- Adjustable intensity

### Data Points Integration

The simulation is designed to handle various cricket data points:

- **Ball Trajectory**: Physics-based ball movement calculations
- **Player Positions**: Dynamic fielding formation management
- **Shot Analysis**: Real-time batting stroke analysis
- **Weather Effects**: Environmental impact on ball behavior
- **Animation Triggers**: Event-based animation system

## Future Enhancements

- Player models and animations
- Ball physics simulation
- Real-time match data integration
- Weather system
- Crowd animations
- Commentary integration
- Match replay system

## Dependencies

- **React**: UI framework
- **Three.js**: 3D graphics library
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers for react-three-fiber
- **Vite**: Build tool and development server

## Performance Optimizations

- Shadow mapping optimization
- Geometry instancing for repeated elements
- Efficient material usage
- Frame rate monitoring
- Conditional rendering based on camera distance

## Contributing

1. Follow functional programming principles
2. Keep components pure and reusable
3. Use TypeScript for type safety (future enhancement)
4. Add proper JSDoc comments
5. Test new features thoroughly

## License

MIT License - Feel free to use for educational and commercial purposes.