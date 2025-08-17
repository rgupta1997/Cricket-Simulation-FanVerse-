import React from 'react';

const UIToggleButton = ({ useCompactUI, setUseCompactUI }) => {
  return (
    <button
        onClick={() => setUseCompactUI(!useCompactUI)}
        style={{
          background: useCompactUI ? 
            'linear-gradient(135deg, #4CAF50, #45a049)' : 
            'linear-gradient(135deg, #FF9800, #f57c00)',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'Arial, sans-serif'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'scale(1)';
        }}
      >
        <span>{useCompactUI ? '📱' : '🖥️'}</span>
        <span>{useCompactUI ? 'Compact UI' : 'Full UI'}</span>
      </button>
  );
};

export default UIToggleButton;
