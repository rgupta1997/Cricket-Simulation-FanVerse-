import React from 'react';

const DirectCoordinateControls = ({ bowlingControls, onUpdate }) => {
  const handleCoordinateChange = (field, value) => {
    const newConfig = { ...bowlingControls, [field]: parseFloat(value) || 0 };
    onUpdate(newConfig);
  };

  const toggleCoordinateMode = () => {
    const newConfig = { 
      ...bowlingControls, 
      useDirectCoordinates: !bowlingControls.useDirectCoordinates 
    };
    onUpdate(newConfig);
  };

  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      {/* Mode Toggle */}
      <div style={{ 
        padding: '8px', 
        background: bowlingControls.useDirectCoordinates ? 'rgba(68,255,68,0.1)' : 'rgba(255,165,0,0.1)', 
        borderRadius: '4px',
        border: `1px solid ${bowlingControls.useDirectCoordinates ? '#44FF44' : '#FFA500'}`
      }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer', 
          gap: '8px',
          fontWeight: 'bold',
          color: bowlingControls.useDirectCoordinates ? '#44FF44' : '#FFA500'
        }}>
          <input
            type="checkbox"
            checked={bowlingControls.useDirectCoordinates}
            onChange={toggleCoordinateMode}
            style={{ transform: 'scale(1.2)' }}
          />
          <span>🎯 Use Direct X,Y,Z Coordinates</span>
        </label>
        <div style={{ fontSize: '10px', color: '#ccc', marginTop: '4px' }}>
          {bowlingControls.useDirectCoordinates 
            ? '✅ Using direct 3D world coordinates' 
            : '📊 Using pitch analysis conversion'}
        </div>
      </div>

      {/* Direct Coordinate Controls */}
      {bowlingControls.useDirectCoordinates && (
        <>
          {/* Release Position */}
          <div style={{ 
            padding: '10px', 
            background: 'rgba(0, 102, 255, 0.1)', 
            borderRadius: '6px',
            border: '1px solid #0066FF'
          }}>
            <div style={{ fontWeight: 'bold', color: '#0066FF', marginBottom: '8px', fontSize: '12px' }}>
              🚀 Release Position (X, Y, Z)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <div>
                <label style={{ fontSize: '10px', color: '#ccc' }}>X (meters)</label>
                <input
                  type="number"
                  step="1"
                  value={bowlingControls.release_x}
                  onChange={(e) => handleCoordinateChange('release_x', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #333',
                    borderRadius: '3px',
                    background: 'rgba(0,102,255,0.1)',
                    color: 'white',
                    fontSize: '10px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#ccc' }}>Y (meters)</label>
                <input
                  type="number"
                  step="1"
                  value={bowlingControls.release_y}
                  onChange={(e) => handleCoordinateChange('release_y', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #333',
                    borderRadius: '3px',
                    background: 'rgba(0,102,255,0.1)',
                    color: 'white',
                    fontSize: '10px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#ccc' }}>Z (meters)</label>
                <input
                  type="number"
                  step="1"
                  value={bowlingControls.release_z}
                  onChange={(e) => handleCoordinateChange('release_z', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #333',
                    borderRadius: '3px',
                    background: 'rgba(0,102,255,0.1)',
                    color: 'white',
                    fontSize: '10px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bounce Position */}
          <div style={{ 
            padding: '10px', 
            background: 'rgba(255, 68, 68, 0.1)', 
            borderRadius: '6px',
            border: '1px solid #FF4444'
          }}>
            <div style={{ fontWeight: 'bold', color: '#FF4444', marginBottom: '8px', fontSize: '12px' }}>
              ⚡ Bounce Position (X, Y, Z)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <div>
                <label style={{ fontSize: '10px', color: '#ccc' }}>X (meters)</label>
                <input
                  type="number"
                  step="1"
                  value={bowlingControls.bounce_x}
                  onChange={(e) => handleCoordinateChange('bounce_x', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #333',
                    borderRadius: '3px',
                    background: 'rgba(255,68,68,0.1)',
                    color: 'white',
                    fontSize: '10px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#ccc' }}>Y (meters)</label>
                <input
                  type="number"
                  step="1"
                  value={bowlingControls.bounce_y}
                  onChange={(e) => handleCoordinateChange('bounce_y', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #333',
                    borderRadius: '3px',
                    background: 'rgba(255,68,68,0.1)',
                    color: 'white',
                    fontSize: '10px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#ccc' }}>Z (meters)</label>
                <input
                  type="number"
                  step="1"
                  value={bowlingControls.bounce_z}
                  onChange={(e) => handleCoordinateChange('bounce_z', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #333',
                    borderRadius: '3px',
                    background: 'rgba(255,68,68,0.1)',
                    color: 'white',
                    fontSize: '10px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Final Position */}
          <div style={{ 
            padding: '10px', 
            background: 'rgba(68, 255, 68, 0.1)', 
            borderRadius: '6px',
            border: '1px solid #44FF44'
          }}>
            <div style={{ fontWeight: 'bold', color: '#44FF44', marginBottom: '8px', fontSize: '12px' }}>
              🎯 Final Position (X, Y, Z)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <div>
                <label style={{ fontSize: '10px', color: '#ccc' }}>X (meters)</label>
                <input
                  type="number"
                  step="1"
                  value={bowlingControls.final_x}
                  onChange={(e) => handleCoordinateChange('final_x', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #333',
                    borderRadius: '3px',
                    background: 'rgba(68,255,68,0.1)',
                    color: 'white',
                    fontSize: '10px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#ccc' }}>Y (meters)</label>
                <input
                  type="number"
                  step="1"
                  value={bowlingControls.final_y}
                  onChange={(e) => handleCoordinateChange('final_y', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #333',
                    borderRadius: '3px',
                    background: 'rgba(68,255,68,0.1)',
                    color: 'white',
                    fontSize: '10px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#ccc' }}>Z (meters)</label>
                <input
                  type="number"
                  step="1"
                  value={bowlingControls.final_z}
                  onChange={(e) => handleCoordinateChange('final_z', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px',
                    border: '1px solid #333',
                    borderRadius: '3px',
                    background: 'rgba(68,255,68,0.1)',
                    color: 'white',
                    fontSize: '10px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Coordinate Reference */}
          <div style={{ 
            padding: '6px', 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '4px',
            fontSize: '9px',
            color: '#aaa'
          }}>
            <div style={{ fontWeight: 'bold', color: '#FFD700', marginBottom: '3px' }}>
              📏 Coordinate Reference:
            </div>
            <div>• X: Left(-) ↔ Right(+) | Pitch width ~3m</div>
            <div>• Y: Ground(0) ↔ Height(+) | Release ~2m</div>
            <div>• Z: Bowler(+11) ↔ Wicket(-10) | Pitch 22m</div>
          </div>
        </>
      )}
    </div>
  );
};

export default DirectCoordinateControls;
