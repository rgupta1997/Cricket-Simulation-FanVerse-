import { useState } from 'react';

const BallShotControl = ({ onUpdateConfig, currentConfig, gameState, onResetBall }) => {
  const [shotConfig, setShotConfig] = useState({
    lofted: false,
    degree: 0,
    distance: 30,
    useDirectControl: false,
    autoPlay: false,
    ...currentConfig
  });

  const handleUpdate = (field, value) => {
    const newConfig = { 
      ...shotConfig, 
      [field]: field === 'lofted' || field === 'useDirectControl' || field === 'autoPlay' 
        ? value 
        : parseFloat(value) 
    };
    setShotConfig(newConfig);
    if (onUpdateConfig) {
      onUpdateConfig(newConfig);
    }
  };

  // Calculate X and Z coordinates from degree and distance
  const calculateCoordinates = () => {
    const radians = (shotConfig.degree * Math.PI) / 180;
    const x = Math.cos(radians) * shotConfig.distance;
    const z = Math.sin(radians) * shotConfig.distance;
    return { x: x.toFixed(2), z: z.toFixed(2) };
  };

  const coords = calculateCoordinates();

  // Preset shot directions for quick selection
  const presetShots = [
    { name: 'Point', degree: 0, icon: '→' },
    { name: 'Cover', degree: 45, icon: '↗' },
    { name: 'Straight', degree: 90, icon: '↑' },
    { name: 'Mid-Wicket', degree: 135, icon: '↖' },
    { name: 'Square Leg', degree: 180, icon: '←' },
    { name: 'Fine Leg', degree: 225, icon: '↙' },
    { name: 'Long On', degree: 270, icon: '↓' },
    { name: 'Mid Off', degree: 315, icon: '↘' }
  ];

  const loadPreset = (degree) => {
    handleUpdate('degree', degree);
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
            0°=Point, 90°=Straight, 180°=Square Leg
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            📏 Distance (meters)
          </label>
          <input
            type="number"
            min="5"
            max="100"
            step="5"
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
            Boundary ≈ 70m, Inner circle ≈ 30m
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
