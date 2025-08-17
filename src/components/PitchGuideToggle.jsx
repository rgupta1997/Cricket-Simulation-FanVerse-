import React from 'react';

const PitchGuideToggle = ({ 
  showMarkers, 
  setShowMarkers, 
  showCoordinates, 
  setShowCoordinates,
  showGrid,
  setShowGrid 
}) => {
  return (
    <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        minWidth: '180px',
        border: '1px solid #333'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#FFD700' }}>
          🎯 Pitch Guides
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showMarkers}
              onChange={(e) => setShowMarkers(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Show Position Markers
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showCoordinates}
              onChange={(e) => setShowCoordinates(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Show Coordinates Panel
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Show Pitch Grid
          </label>
        </div>
        
        <div style={{ 
          marginTop: '8px', 
          fontSize: '10px', 
          color: '#aaa',
          borderTop: '1px solid #333',
          paddingTop: '5px'
        }}>
          <div>🔵 Release • 🔴 Bounce • 🟢 Final</div>
        </div>
      </div>
  );
};

export default PitchGuideToggle;
