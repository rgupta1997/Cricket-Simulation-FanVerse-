# 🏏 Dummy Data Cricket Simulator

## Overview

The Embedded Cricket Simulator now supports **dummy data functionality** that allows you to quickly load realistic cricket match scenarios without requiring full match/team data from external APIs.

## 🎯 Features

### 1. **Load Demo Button**
- Green button with plus icon in the embedded simulator
- Instantly loads a pre-configured T20 match scenario
- Shows "Demo Mode Active" indicator when loaded

### 2. **Dummy Data Includes**
- **Match State**: T20 match in progress (Over 14.5)
- **Score**: 127/3 (14.5 overs, target 185)
- **Players**: Full team with names (Virat Kohli, KL Rahul, etc.)
- **Field Positions**: Realistic fielding setup
- **Ball Physics**: Pre-configured bowling/batting settings
- **Match Context**: Run rates, required rates, etc.

### 3. **Clear Demo Button**
- Red button with X icon to reset to default state
- Clears all dummy data and returns to clean simulator
- Removes demo mode indicator

## 📁 File Structure

```
src/
├── data/
│   └── dummyStadiumData.json     # Contains all dummy match data
├── components/
│   ├── EmbeddedSimulator.jsx     # Main component with UI controls
│   ├── Stadium.jsx               # Passes dummy data to cricket game
│   └── CricketGame.jsx           # Applies dummy data to game state
└── ...
```

## 🔧 Implementation Details

### Dummy Data Structure
```json
{
  "stadiumSimulation": {
    "gameState": {
      "score": { "runs": 127, "wickets": 3, "overs": 14, "balls": 5 },
      "gameState": "waiting_for_ball",
      "ballState": "with_bowler"
    },
    "players": {
      "striker": { "name": "Virat Kohli", "position": [0, 0, -9] },
      "bowler": { "name": "Jasprit Bumrah", "position": [0, 0, 15] },
      "fielders": [ /* 9 fielders with positions */ ]
    },
    "controls": {
      "bowling": { /* realistic bowling settings */ },
      "ballShot": { /* shot configuration */ }
    }
  }
}
```

### Component Props Flow
```
EmbeddedSimulator 
  ↓ dummyGameData, isDummyDataActive
Stadium 
  ↓ dummyGameData, isDummyDataActive  
CricketGame
  ↓ applies dummy data to game state
```

## 🎮 Usage

### For Developers

1. **Import the component:**
```jsx
import EmbeddedSimulator from './components/EmbeddedSimulator';
```

2. **Use in your app:**
```jsx
<EmbeddedSimulator 
  matchId={matchId} 
  onExpand={() => setCurrentView('simulator')}
/>
```

3. **The dummy data functionality is built-in** - no additional props needed!

### For Users

1. **Load Demo**: Click the green "Load Demo" button
2. **Explore**: Use mouse to pan/zoom/rotate the 3D stadium
3. **Play**: The simulation includes realistic player positions and match state
4. **Clear**: Click red "Clear Demo" button to reset

## 🔄 State Management

The dummy data system uses React state to manage:

- `isDummyDataLoaded`: Boolean tracking if dummy data is active
- `currentGameData`: Current dummy data object or null
- Automatic application to `CricketGame` component state
- Clean reset when dummy data is cleared

## 🎨 Visual Indicators

### Demo Mode Active Indicator
- Green badge with pulsing dot
- "Demo Mode Active" text
- Positioned below control buttons
- Auto-hides when demo is cleared

### Button States
- **Load Demo**: Green with plus icon (when inactive)
- **Clear Demo**: Red with X icon (when active)
- **Expand**: White button (always available)

## 🧪 Testing

Use the provided test file: `test-dummy-simulator.html`

### Test Scenarios
1. **Initial Load**: Verify default empty state
2. **Load Demo**: Click button, verify data loads correctly
3. **Visual Check**: Confirm score shows 127/3 (14.5)
4. **Player Positions**: Verify realistic field setup
5. **Clear Demo**: Reset and verify clean state

## 🚀 Benefits

### For Development
- **Quick Testing**: No need for full API integration
- **Realistic Scenarios**: Pre-configured match situations
- **Visual Verification**: Easy to see if simulation works

### For Demos
- **Instant Content**: Show working simulator immediately
- **No Dependencies**: Works without external match data
- **Professional Look**: Realistic player names and stats

## 📊 Dummy Data Scenario

The default dummy scenario represents:

**Match**: T20 - Over 14.5/20
- **Batting Team**: 127/3 (Run rate: 8.6)
- **Target**: 185 (Required rate: 11.2)
- **Striker**: Virat Kohli (45 runs, 32 balls)
- **Non-Striker**: KL Rahul (28 runs, 24 balls)
- **Bowler**: Jasprit Bumrah (2.5 overs, 18 runs, 1 wicket)
- **Last Action**: Boundary - driven through covers for four

## 🔮 Future Enhancements

Potential improvements:
- Multiple dummy scenarios (different match situations)
- Editable dummy data via UI
- Export/import custom scenarios
- Match progression simulation
- Real-time dummy match simulation

## 💡 Usage Tips

1. **Demo Presentations**: Use dummy data for showcasing the simulator
2. **Development Testing**: Quick way to test different match states
3. **UI Development**: Focus on UI without API complexity
4. **Performance Testing**: Consistent data for performance measurements

---

**Ready to simulate! 🏏** Click "Load Demo" and experience the cricket action.
