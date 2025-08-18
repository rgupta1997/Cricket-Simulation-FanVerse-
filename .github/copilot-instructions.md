# Cricket Simulation - AI Development Guide

## 🏏 Project Overview
This is a **3D cricket simulation platform** combining immersive WebGL gameplay with live cricket data integration. Built with React + Three.js for 3D visualization and Vite for development tooling.

## 🏗️ Core Architecture

### **Dual Application Structure**
- **`/simulator`** - 3D cricket game with physics simulation  
- **`/webapp`** - Live cricket data dashboard with API integration
- **`/bones`** - Player model bone structure editor
- **Shared components** across all routes via `src/components/`

### **Key Architectural Patterns**
- **Functional Programming**: Pure functions in `utils/functionalPositionManager.js` for player positioning
- **Component Composition**: 3D scene built via React Three Fiber declarative components
- **State Lifting**: Camera controls and position management lifted to App level
- **Service Layer**: API transformations in `services/webappApiService.js`

## 🔧 Development Workflow

### **Essential Commands**
```bash
npm run dev         # Start Vite dev server (port 5173)
npm run build       # Production build
npm run preview     # Preview production build
```

### **Development Server Setup**
- **Proxy Configuration**: `vite.config.js` proxies `/api/sportz` and `/api/fixtures` to external cricket APIs
- **Hot Reload**: All 3D components auto-reload without losing WebGL context
- **Browser Requirement**: Chrome/Firefox for WebGL support

## 📁 Critical File Patterns

### **3D Component Structure**
```
src/components/
├── Stadium.jsx          # Main 3D scene container
├── CricketGame.jsx      # Game logic + player positioning
├── Camera.jsx           # Custom camera with smooth transitions
├── players/             # 3D player models and animations
└── PlayerPositionManager.jsx  # Position editing UI overlay
```

### **Data Integration Layer**
```
src/services/webappApiService.js  # Live cricket API integration
src/utils/functionalPositionManager.js  # Pure position functions
src/constants/playerPositions.js   # Field positioning data
```

### **Hook-Based State Management**
- `useCameraControls()` - Camera view switching with keyboard shortcuts
- Custom hooks in `src/hooks/` for data fetching and state management

## 🎮 Key Integration Points

### **Player Position System**
- **Functional Approach**: All position updates use pure functions from `functionalPositionManager.js`
- **Real-time Updates**: Position changes flow: `PlayerPositionManager` → `currentPlayerPositions` → `CricketGame`
- **Keyboard Controls**: `Shift+E` toggles position editor globally

### **Camera System** 
- **View Switching**: Number keys 1-6 switch camera angles OR accordion UI buttons
- **Smooth Transitions**: Custom lerp-based camera transitions in `Camera.jsx`
- **Stadium Toggle**: `C` key switches between procedural vs 3D model stadium

### **API Data Flow**
```
Sportz.io APIs → webappApiService.js → Transform to cricketData.json format → React components
```

## 🚀 Adding Features

### **New 3D Components**
- Extend `src/components/players/` for new player types
- Use `useFrame()` for animations, `useLoader()` for GLB models
- Follow existing shadow casting patterns (`castShadow`, `receiveShadow`)

### **Position Management**
- Add new positions to `constants/playerPositions.js`
- Use functional approach: create pure functions in `functionalPositionManager.js`
- Integrate via `currentPlayerPositions` prop flow

### **API Integration**
- Extend `webappApiService.js` transformation methods
- Follow existing pattern: `fetch → transform → cricketData.json structure`
- Use proxy endpoints in `vite.config.js` for CORS handling

## 🔍 Debugging Patterns

### **3D Issues**
- Check browser console for WebGL errors
- Use `<Stats />` component from drei for performance monitoring
- Verify GLB model loading via console logs in `PlayerModel.jsx`

### **Position System**
- Console logs in `functionalPositionManager.js` show move operations
- `PlayerPositionManager` logs all position state changes
- Verify field constraints in `constants/playerPositions.js`

### **API Integration**
- Enable detailed API logging in `webappApiService.js` (🏏, 💬, 🔄 prefixed logs)
- Check network tab for proxy redirections
- Verify data transformation output in browser console

## 🎯 Project-Specific Conventions

- **Functional purity** for position management (no side effects in utils)
- **Three.js mesh positioning** uses `[x, Y_CONSTANT, z]` (Y fixed at ground level)
- **Component naming**: 3D components are PascalCase, data utilities are camelCase
- **State flow**: Always lift position state to App level, pass down as props
- **Error boundaries**: API failures gracefully degrade to dummy data

Focus on **functional programming patterns** for position management and **declarative 3D scene composition** when working with the React Three Fiber components.
