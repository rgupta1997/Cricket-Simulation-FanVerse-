# Cricket Simulation Setup Instructions

## Quick Setup Guide

### 1. Install Node.js
1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS version** (Long Term Support)
3. Run the installer and follow the setup wizard
4. **Restart your PowerShell/Command Prompt** after installation

### 2. Verify Installation
Open PowerShell and run:
```bash
node --version
npm --version
```
You should see version numbers like:
```
v18.17.0
9.6.7
```

### 3. Install Project Dependencies
In your project folder, run:
```bash
npm install
```

### 4. Start the Cricket Game
```bash
npm run dev
```

### 5. Open in Browser
- The game will be available at: `http://localhost:3000`
- You should see the 3D cricket stadium

## Cricket Game Controls

### 🏏 Main Game Controls
| Key | Action | Description |
|-----|--------|-------------|
| **SPACEBAR** | Bowl | Bowler delivers the ball |
| **D** | Defensive Shot | Safe defensive stroke |
| **F** | Drive Shot | Powerful straight drive |
| **G** | Pull Shot | Cross-bat pull shot |
| **H** | Cut Shot | Square cut shot |
| **V** | Loft Shot | Aerial lofted shot |
| **T** | Throw to Keeper | Field and return ball |
| **P** | Pause/Play | Game control |

### 📹 Camera Controls
| Key | View |
|-----|------|
| **1** | Umpire View |
| **2** | Top View |
| **3** | Bird Eye View |
| **4** | Left View |
| **5** | Right View |
| **6** | Center View |
| **C** | Toggle Stadium Model |
| **W** | Toggle Wagon Wheel Overlay |

## How to Play

1. **Start**: Press `SPACEBAR` to bowl
2. **Bat**: When ball approaches, press `D`, `F`, `G`, `H`, or `V` for different shots
3. **Field**: Watch fielders automatically collect the ball
4. **Return**: Press `T` to throw ball back to keeper
5. **Repeat**: Continue the cricket match!

## Troubleshooting

### If the game is still static:
1. Check browser console (F12) for error messages
2. Make sure you're accessing `http://localhost:3000` (not opening HTML file directly)
3. Ensure all dependencies installed with `npm install`

### If players don't move:
1. Check console for debug messages when pressing keys
2. Make sure you're clicking in the game window first (to focus it)
3. Try different camera views with number keys 1-6

### Performance Issues:
- Use Chrome or Firefox for best Three.js performance
- Close other browser tabs if the game runs slowly
- Try pressing `C` to switch between basic and 3D stadium models