import React, { useState } from 'react';
import inputData from '../data/input.json';

const BowlingConfigPanel = ({ onUpdateConfig, currentConfig }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [config, setConfig] = useState(currentConfig || inputData.bowling_parameters);

  const handleUpdate = (field, value) => {
    const newConfig = { ...config, [field]: parseFloat(value) };
    setConfig(newConfig);
    if (onUpdateConfig) {
      onUpdateConfig(newConfig);
    }
  };

  const loadFromAnalysis = () => {
    const analysisConfig = inputData.bowling_parameters;
    setConfig(analysisConfig);
    if (onUpdateConfig) {
      onUpdateConfig(analysisConfig);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000,
      minWidth: '250px'
    }}>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}
      >
        🎯 Enhanced Bowling Config {isExpanded ? '▼' : '▶'}
      </div>
      
      {isExpanded && (
        <div>
          <div style={{ marginBottom: '10px' }}>
            <button 
              onClick={loadFromAnalysis}
              style={{
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Load Pitch Analysis Data
            </button>
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <div>
              <label>Velocity (km/h):</label>
              <input
                type="number"
                value={config.velocity}
                onChange={(e) => handleUpdate('velocity', e.target.value)}
                style={{ width: '60px', marginLeft: '5px' }}
              />
            </div>

            <div>
              <label>Ball Axis X:</label>
              <input
                type="number"
                step="0.01"
                value={config.ball_axis_x}
                onChange={(e) => handleUpdate('ball_axis_x', e.target.value)}
                style={{ width: '60px', marginLeft: '5px' }}
              />
            </div>

            <div>
              <label>Ball Axis Y:</label>
              <input
                type="number"
                step="0.01"
                value={config.ball_axis_y}
                onChange={(e) => handleUpdate('ball_axis_y', e.target.value)}
                style={{ width: '60px', marginLeft: '5px' }}
              />
            </div>

            <div>
              <label>Length Axis X:</label>
              <input
                type="number"
                step="0.01"
                value={config.length_axis_x}
                onChange={(e) => handleUpdate('length_axis_x', e.target.value)}
                style={{ width: '60px', marginLeft: '5px' }}
              />
            </div>

            <div>
              <label>Length Axis Z:</label>
              <input
                type="number"
                step="0.01"
                value={config.length_axis_z}
                onChange={(e) => handleUpdate('length_axis_z', e.target.value)}
                style={{ width: '60px', marginLeft: '5px' }}
              />
            </div>

            <div>
              <label>Line Axis X:</label>
              <input
                type="number"
                step="0.01"
                value={config.line_axis_x}
                onChange={(e) => handleUpdate('line_axis_x', e.target.value)}
                style={{ width: '60px', marginLeft: '5px' }}
              />
            </div>

            <div>
              <label>Line Axis Z:</label>
              <input
                type="number"
                step="0.01"
                value={config.line_axis_z}
                onChange={(e) => handleUpdate('line_axis_z', e.target.value)}
                style={{ width: '60px', marginLeft: '5px' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '10px', fontSize: '10px', color: '#ccc' }}>
            <div>🏏 Ball Axis: Final ball position</div>
            <div>📍 Length Axis: Bounce position on pitch</div>
            <div>🎯 Line Axis: Bowler release position</div>
          </div>
        </div>
      )}
      </div>
  );
};

export default BowlingConfigPanel;
