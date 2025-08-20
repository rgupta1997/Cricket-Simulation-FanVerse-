import { useState } from 'react';

const BallShotControl = ({ onUpdateConfig, currentConfig, gameState, onResetBall }) => {
  const [shotConfig, setShotConfig] = useState({
    lofted: false,
    degree: 0,
    distance: 15,                   // Default to 15 meters (reasonable shot distance)
    useDirectControl: false,
    autoPlay: false,
    keeperAutoCollect: true,        // Whether keeper should auto-collect balls
    keeperCollectionRadius: 2.0,    // Distance within which keeper collects (meters)
    keeperSpeedThreshold: 3.0,      // Maximum speed for keeper to collect (m/s)
    resetDelay: 3.0,                // Delay in seconds before resetting ball after shot completes
    ...currentConfig
  });

  const handleUpdate = (field, value) => {
    const newConfig = { 
      ...shotConfig, 
      [field]: ['lofted', 'useDirectControl', 'autoPlay', 'keeperAutoCollect'].includes(field)
        ? value 
        : parseFloat(value) 
    };
    setShotConfig(newConfig);
    if (onUpdateConfig) {
      onUpdateConfig(newConfig);
    }
  };

  // Calculate coordinates using PHYSICS-BASED FINAL POSITION SYSTEM  
  const calculateCoordinates = () => {
    // Use distance as FINAL TARGET POSITION after physics
    const targetDistance = Math.max(0.1, shotConfig.distance);
    
    // Physics approximation for where ball should land vs where it stops
    const BOUNCE_ENERGY_RETENTION = 0.6;
    const FRICTION_FACTOR = 0.85;
    const AIR_RESISTANCE_FACTOR = 0.95;
    const TOTAL_PHYSICS_FACTOR = BOUNCE_ENERGY_RETENTION * FRICTION_FACTOR * AIR_RESISTANCE_FACTOR;
    
    // Calculate initial landing distance (where ball first hits ground)
    const momentumDistance = targetDistance * (1 - TOTAL_PHYSICS_FACTOR);
    const landingDistance = Math.max(0.1, targetDistance - momentumDistance);
    
    // Calculate boundary for reference
    const calculateBoundaryDistance = (angleDegrees) => {
      const PLAYABLE_BOUNDARY_RADIUS = 25.5;
      const STRIKER_POS = [0, 0, -9];
      
      const angleRad = (angleDegrees * Math.PI) / 180;
      const dirX = Math.cos(angleRad);
      const dirZ = -Math.sin(angleRad);
      
      const strikerX = STRIKER_POS[0];
      const strikerZ = STRIKER_POS[2];
      
      const a = dirX * dirX + dirZ * dirZ;
      const b = 2 * (strikerX * dirX + strikerZ * dirZ);
      const c = strikerX * strikerX + strikerZ * strikerZ - PLAYABLE_BOUNDARY_RADIUS * PLAYABLE_BOUNDARY_RADIUS;
      
      const discriminant = b * b - 4 * a * c;
      if (discriminant < 0) return 20;
      
      const t = (-b + Math.sqrt(discriminant)) / (2 * a);
      return Math.sqrt((t * dirX) ** 2 + (t * dirZ) ** 2);
    };
    
    const boundaryDistance = calculateBoundaryDistance(shotConfig.degree);
    
    // Direct angle conversion: 0°=East, 90°=North(keeper), 180°=West, 270°=South(bowler)
    const radians = (shotConfig.degree * Math.PI) / 180;
    
    // Calculate FINAL TARGET position (where ball should stop)
    const targetX = Math.cos(radians) * targetDistance;
    const targetZ = -Math.sin(radians) * targetDistance;
    const finalTargetX = 0 + targetX;
    const finalTargetZ = -9 + targetZ;
    
    // Calculate initial landing position (for physics simulation)
    const landingX = Math.cos(radians) * landingDistance;
    const landingZ = -Math.sin(radians) * landingDistance;
    const finalLandingX = 0 + landingX;
    const finalLandingZ = -9 + landingZ;
    
    const percentageOfBoundary = ((targetDistance / boundaryDistance) * 100).toFixed(1);
    console.log(`🎯 PHYSICS TARGET: ${targetDistance.toFixed(1)}m (${percentageOfBoundary}% of boundary) | Landing: ${landingDistance.toFixed(1)}m → Final Stop: [${finalTargetX.toFixed(1)}, ${finalTargetZ.toFixed(1)}]`);
    
    // Return target position for UI display (where ball will finally stop)
    return { 
      x: finalTargetX.toFixed(1), 
      z: finalTargetZ.toFixed(1),
      landingX: finalLandingX.toFixed(1),
      landingZ: finalLandingZ.toFixed(1)
    };
  };

  const coords = calculateCoordinates();

  // Preset shot directions with realistic distances
  const presetShots = [
    { name: 'East (0°)', degree: 0, icon: '→', distance: 15 },
    { name: 'NE (45°)', degree: 45, icon: '↗', distance: 12 },
    { name: 'North (90°)', degree: 90, icon: '↑', distance: 8 },
    { name: 'NW (135°)', degree: 135, icon: '↖', distance: 12 },
    { name: 'West (180°)', degree: 180, icon: '←', distance: 15 },
    { name: 'SW (225°)', degree: 225, icon: '↙', distance: 25 },
    { name: 'South (270°)', degree: 270, icon: '↓', distance: 30 },
    { name: 'SE (315°)', degree: 315, icon: '↘', distance: 25 }
  ];

  // Load preset configuration with distance
  const loadPreset = (degree, distance = null) => {
    handleUpdate('degree', degree);
    if (distance !== null) {
      handleUpdate('distance', distance);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '12px', fontSize: '11px' }}>
      {/* Auto Shot Toggle */}
      <div style={{ 
        padding: '8px', 
        background: shotConfig.autoPlay ? 'rgba(0, 255, 0, 0.2)' : 'rgba(100, 100, 100, 0.2)', 
        borderRadius: '4px',
        border: `1px solid ${shotConfig.autoPlay ? '#00FF00' : '#666'}`
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={shotConfig.autoPlay}
            onChange={(e) => handleUpdate('autoPlay', e.target.checked)}
            style={{ transform: 'scale(1.2)' }}
          />
          <span style={{ fontWeight: 'bold', color: shotConfig.autoPlay ? '#00FF00' : '#ccc' }}>
            🤖 Auto Play Shot
          </span>
        </label>
        <div style={{ fontSize: '10px', color: '#aaa', marginTop: '4px' }}>
          {shotConfig.autoPlay 
            ? 'Ball will automatically be shot when it reaches batsman' 
            : 'Manual shot control via keyboard'}
        </div>
      </div>

      {/* Reset Ball Button */}
      <div style={{ 
        padding: '8px', 
        background: 'rgba(255, 100, 100, 0.2)', 
        borderRadius: '4px',
        border: '1px solid #FF6666'
      }}>
        <button
          onClick={() => onResetBall && onResetBall('manual_ui_reset')}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'linear-gradient(135deg, #FF6666, #FF4444)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          🔄 Reset Ball to Bowler
        </button>
        <div style={{ fontSize: '10px', color: '#aaa', marginTop: '4px' }}>
          Resets ball position and game state (Hotkey: R)
        </div>
      </div>

      {/* Shot Type */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={shotConfig.lofted}
            onChange={(e) => handleUpdate('lofted', e.target.checked)}
            style={{ transform: 'scale(1.2)' }}
          />
          <span style={{ fontWeight: 'bold', color: shotConfig.lofted ? '#FFD700' : '#ccc' }}>
            {shotConfig.lofted ? '🚀' : '🏏'} {shotConfig.lofted ? 'Lofted Shot' : 'Ground Shot'}
          </span>
        </label>
      </div>

      {/* Preset Shot Directions */}
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#00AAFF' }}>
          🎯 Quick Shot Directions
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '4px' 
        }}>
          {presetShots.map((shot) => (
            <button
              key={shot.name}
              onClick={() => loadPreset(shot.degree)}
              style={{
                padding: '6px 4px',
                background: shotConfig.degree === shot.degree ? '#00AAFF' : 'rgba(255,255,255,0.1)',
                color: shotConfig.degree === shot.degree ? '#000' : '#fff',
                border: '1px solid #333',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '9px',
                fontWeight: 'bold'
              }}
            >
              <div>{shot.icon}</div>
              <div>{shot.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Controls */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '8px' 
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            📐 Degree (0-360°)
          </label>
          <input
            type="number"
            min="0"
            max="360"
            step="5"
            value={shotConfig.degree}
            onChange={(e) => handleUpdate('degree', e.target.value)}
            style={{
              width: '100%',
              padding: '4px',
              border: '1px solid #333',
              borderRadius: '3px',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '11px'
            }}
          />
          <div style={{ fontSize: '9px', color: '#aaa', marginTop: '2px' }}>
            0°=East, 90°=North(Keeper), 180°=West, 270°=South(Bowler)
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            📏 Distance (meters)
          </label>
          <input
            type="number"
            min="0.1"
            max="40"
            step="0.1"
            value={shotConfig.distance}
            onChange={(e) => handleUpdate('distance', e.target.value)}
            style={{
              width: '100%',
              padding: '4px',
              border: '1px solid #333',
              borderRadius: '3px',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '11px'
            }}
          />
          <div style={{ fontSize: '9px', color: '#aaa', marginTop: '2px' }}>
            0.1-40m: FINAL stopping distance after physics (bounce/roll). Ball lands closer, then rolls to target.
          </div>
        </div>
      </div>

      {/* Direct XZ Control Toggle */}
      <div style={{ 
        padding: '6px', 
        background: 'rgba(255, 255, 0, 0.1)', 
        borderRadius: '4px',
        border: '1px solid #FFFF00'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={shotConfig.useDirectControl}
            onChange={(e) => handleUpdate('useDirectControl', e.target.checked)}
            style={{ transform: 'scale(1.1)' }}
          />
          <span style={{ fontWeight: 'bold', color: '#FFFF00', fontSize: '10px' }}>
            🎯 Use Direct X,Z Coordinates
          </span>
        </label>
      </div>

      {/* Calculated Coordinates Display */}
      <div style={{ 
        padding: '8px', 
        background: 'rgba(0, 255, 255, 0.2)', 
        borderRadius: '4px',
        border: '1px solid #00FFFF'
      }}>
        <div style={{ fontWeight: 'bold', color: '#00FFFF', marginBottom: '4px' }}>
          📊 Calculated Shot Trajectory
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <div style={{ color: '#aaa' }}>X Coordinate:</div>
            <div style={{ fontWeight: 'bold', color: '#fff' }}>{coords.x}m</div>
          </div>
          <div>
            <div style={{ color: '#aaa' }}>Z Coordinate:</div>
            <div style={{ fontWeight: 'bold', color: '#fff' }}>{coords.z}m</div>
          </div>
        </div>
        <div style={{ fontSize: '9px', color: '#aaa', marginTop: '4px' }}>
          {shotConfig.lofted ? '🚀 Lofted trajectory (aerial)' : '🏏 Ground trajectory (along surface)'}
        </div>
      </div>

      {/* Keeper Collection Settings */}
      <div style={{ 
        padding: '8px', 
        background: 'rgba(255, 140, 0, 0.2)', 
        borderRadius: '4px',
        border: '1px solid #FF8C00'
      }}>
        <div style={{ fontWeight: 'bold', color: '#FF8C00', marginBottom: '6px' }}>
          🧤 Keeper Collection Settings
        </div>
        
        {/* Auto Collection Toggle */}
        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={shotConfig.keeperAutoCollect}
              onChange={(e) => handleUpdate('keeperAutoCollect', e.target.checked)}
              style={{ transform: 'scale(1.2)' }}
            />
            <span style={{ fontWeight: 'bold', color: shotConfig.keeperAutoCollect ? '#00FF00' : '#FF6666' }}>
              {shotConfig.keeperAutoCollect ? '✅ Auto-Collect Enabled' : '❌ Auto-Collect Disabled'}
            </span>
          </label>
          <div style={{ fontSize: '9px', color: '#aaa', marginTop: '2px' }}>
            {shotConfig.keeperAutoCollect 
              ? 'Keeper will collect balls based on settings below' 
              : 'Keeper will NOT auto-collect any balls - all shots reach full distance'}
          </div>
        </div>

        {/* Collection Settings - Only show if auto-collect is enabled */}
        {shotConfig.keeperAutoCollect && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
              <div>
                <label style={{ fontSize: '9px', color: '#ccc' }}>Collection Radius (m)</label>
                <input
                  type="number"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={shotConfig.keeperCollectionRadius}
                  onChange={(e) => handleUpdate('keeperCollectionRadius', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '3px',
                    border: '1px solid #333',
                    borderRadius: '3px',
                    background: 'rgba(255,140,0,0.1)',
                    color: 'white',
                    fontSize: '10px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '9px', color: '#ccc' }}>Max Speed (m/s)</label>
                <input
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={shotConfig.keeperSpeedThreshold}
                  onChange={(e) => handleUpdate('keeperSpeedThreshold', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '3px',
                    border: '1px solid #333',
                    borderRadius: '3px',
                    background: 'rgba(255,140,0,0.1)',
                    color: 'white',
                    fontSize: '10px'
                  }}
                />
              </div>
            </div>
            <div style={{ fontSize: '9px', color: '#aaa' }}>
              Keeper collects balls within {shotConfig.keeperCollectionRadius}m if speed &lt; {shotConfig.keeperSpeedThreshold} m/s
            </div>
          </>
        )}
      </div>

      {/* Reset Delay Setting */}
      <div style={{ 
        padding: '8px', 
        background: 'rgba(100, 100, 255, 0.2)', 
        borderRadius: '4px',
        border: '1px solid #6666FF'
      }}>
        <div style={{ fontWeight: 'bold', color: '#6666FF', marginBottom: '6px' }}>
          ⏱️ Reset Delay Setting
        </div>
        <div>
          <label style={{ fontSize: '9px', color: '#ccc' }}>Delay before reset (seconds)</label>
          <input
            type="number"
            min="0.5"
            max="10"
            step="0.5"
            value={shotConfig.resetDelay}
            onChange={(e) => handleUpdate('resetDelay', e.target.value)}
            style={{
              width: '100%',
              padding: '3px',
              border: '1px solid #333',
              borderRadius: '3px',
              background: 'rgba(100,100,255,0.1)',
              color: 'white',
              fontSize: '10px'
            }}
          />
          <div style={{ fontSize: '9px', color: '#aaa', marginTop: '2px' }}>
            Time to observe ball position before auto-reset ({shotConfig.resetDelay}s)
          </div>
        </div>
      </div>

      {/* Status Display */}
      {gameState && (
        <div style={{ 
          padding: '6px', 
          background: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '4px',
          fontSize: '10px'
        }}>
          <div style={{ color: '#aaa' }}>Game State: {gameState.currentPhase || 'Waiting'}</div>
          <div style={{ color: '#aaa' }}>Ball Status: {gameState.ballPhase || 'Ready'}</div>
        </div>
      )}
    </div>
  );
};

export default BallShotControl;
