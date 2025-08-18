import React from 'react';

const ZoneMarkersToggle = ({ show, toggle }) => {
  return (
    <div style={{ 
      padding: '8px', 
      background: 'rgba(0, 255, 0, 0.1)', 
      borderRadius: '4px',
      border: '1px solid #00FF00'
    }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#00FF00', fontSize: '12px' }}>
        🎯 Distance Zone Markers
      </h4>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          fontSize: '11px',
          color: '#fff',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={show}
            onChange={(e) => toggle(e.target.checked)}
            style={{ transform: 'scale(1.1)' }}
          />
          Show Zone Markings
        </label>
      </div>
      
      <div style={{ 
        fontSize: '9px', 
        color: '#aaa', 
        marginTop: '6px',
        lineHeight: '1.3'
      }}>
        Displays distance zones and shot target on the field. 
        Helpful for visualizing shot placement.
      </div>
      
      {show && (
        <div style={{ 
          fontSize: '9px', 
          color: '#00aa00', 
          marginTop: '4px',
          lineHeight: '1.2'
        }}>
          🟢 Close • 🟡 Inner • 🟠 Deep • 🔴 Approach • 🟣 Boundary • 🔵 Target
        </div>
      )}
    </div>
  );
};

export default ZoneMarkersToggle;
