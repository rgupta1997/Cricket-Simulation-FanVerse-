# Cricket Game Debug Guide

## 🔍 Troubleshooting Static Game

### Step 1: Install Node.js (Primary Issue)
**Most likely cause:** Node.js is not installed
- Download from: https://nodejs.org/ (LTS version)
- Install and restart PowerShell
- Test: `node --version` and `npm --version`

### Step 2: Start Development Server
```bash
npm install
npm run dev
```
- Should show: `Local: http://localhost:3000`
- Open that URL in browser (NOT the HTML file directly)

### Step 3: Check Browser Console
Press **F12** in browser and look for:

#### ✅ Success Messages:
```
🏏 CricketGame component mounted and ready!
Initial game state: waiting_for_ball
Press SPACEBAR to bowl, D/F/G/H/V for batting
OLD Players controls disabled. Use CricketGame controls:
SPACEBAR - Bowl | D/F/G/H/V - Batting | T - Throw to keeper
```

#### ❌ Error Messages to Watch For:
- `npm: The term 'npm' is not recognized` → Install Node.js
- `Cannot resolve module` → Run `npm install`
- `Failed to load resource` → Make sure using localhost:3000, not file://
- No console messages at all → React not loading

### Step 4: Test Game Controls

#### Test Spacebar (Bowling):
1. Press **SPACEBAR**
2. Should see in console:
   ```
   🎳 Spacebar pressed! Current game state: waiting_for_ball
   ✅ Starting bowling action!
   ```
3. Ball should start moving from bowler toward batsman

#### Test Batting:
1. When ball is near batsman, press **D**, **F**, **G**, **H**, or **V**
2. Should see batting response in console
3. Ball should change direction

#### Test Camera Views:
1. Press number keys **1-6**
2. Camera should change position
3. Current view should update in top-right corner

### Step 5: Common Issues & Solutions

#### Issue: "Everything is static, nothing moves"
**Cause:** Not using development server
**Solution:** Must use `npm run dev` and access `http://localhost:3000`

#### Issue: "Spacebar does nothing"
**Check console for:**
- `🎳 Spacebar pressed!` → Key handler working
- `❌ Cannot bowl right now` → Game state issue
- No message → Event handler not attached

#### Issue: "Players don't move"
**Cause:** Using old player system instead of cricket game
**Solution:** Make sure CricketGame component is rendering, not old Players

#### Issue: "No 3D graphics"
**Cause:** Three.js not loading
**Solution:** Check browser compatibility (use Chrome/Firefox)

### Step 6: Alternative Testing

#### Test with Static Version:
1. Open `static-version.html` in browser
2. Shows setup instructions and requirements
3. Not the actual game, but confirms HTML/browser working

#### Manual Debug Steps:
1. Check `package.json` exists
2. Check `node_modules` folder exists after `npm install`
3. Check browser network tab for failed resources
4. Try different browser (Chrome recommended)

### Step 7: Expected Game Behavior

#### Successful Game Flow:
1. **Start:** Game loads with cricket stadium
2. **Players visible:** Striker, non-striker, bowler, keeper, umpires, fielders
3. **Press SPACEBAR:** Bowler animation starts, ball moves toward batsman
4. **Press batting key:** Ball changes direction based on shot
5. **Auto-fielding:** Nearest fielder moves to collect ball
6. **Press T:** Ball throws back to keeper
7. **Repeat:** Game continues

#### Performance Notes:
- Use Chrome or Firefox for best Three.js performance
- Press **C** to toggle between basic/3D stadium if slow
- Check console for any WebGL warnings

### Step 8: Still Not Working?

#### Try Clean Install:
```bash
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

#### Check File Structure:
- Make sure all files in `src/components/` exist
- Verify `public/` folder has assets
- Confirm `vite.config.js` exists

#### Browser Compatibility:
- Requires WebGL support
- Works best in Chrome/Firefox
- May not work in older browsers