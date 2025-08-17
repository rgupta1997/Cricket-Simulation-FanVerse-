import React, { useState } from 'react';
import { calculateBallTrajectory } from './CricketGameState';
import CameraControlsDisabled from './CameraControlsDisabled';
import DirectCoordinateControls from './DirectCoordinateControls';

const CompactAccordion = ({ 
  gameState, 
  onBowlingConfigUpdate,
  showPitchMarkers,
  setShowPitchMarkers,
  showCoordinateDisplay,
  setShowCoordinateDisplay,
  showPitchGrid,
  setShowPitchGrid,
  currentCameraView,
  onCameraViewChange
}) => {
  const [activeTab, setActiveTab] = useState('config');
  const [isMinimized, setIsMinimized] = useState(false);

  const trajectory = calculateBallTrajectory(gameState.controls.bowling);
  const bowlingControls = gameState.controls.bowling;

  const tabs = [
    { id: 'config', label: '⚙️', title: 'Config' },
    { id: 'xyz', label: '🎯', title: 'X,Y,Z' },
    { id: 'analysis', label: '📊', title: 'Analysis' },
    { id: 'coordinates', label: '📐', title: 'Coords' },
    { id: 'camera', label: '📹', title: 'Camera' },
    { id: 'guides', label: '👁️', title: 'Guides' }
  ];

  const handleUpdate = (field, value) => {
    const newConfig = { ...bowlingControls, [field]: parseFloat(value) };
    onBowlingConfigUpdate(newConfig);
  };

  const loadFromAnalysis = () => {
    const analysisData = {
      velocity: 133.5,
      ball_axis_x: 35.74,
      ball_axis_y: 18.40,
      length_axis_x: 55.89,
      length_axis_z: 8.07,
      line_axis_x: 39.04,
      line_axis_z: 23.93
    };
    onBowlingConfigUpdate(analysisData);
  };

  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#FFD700',
          padding: '8px 12px',
          borderRadius: '20px',
          cursor: 'pointer',
          border: '2px solid #FFD700',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
        }}
      >
        🏏 Show Controls
      </div>
    );
  }

  return (
    <div style={{
        width: '320px',
        background: 'rgba(0, 0, 0, 0.95)',
        border: '2px solid #FFD700',
        borderRadius: '12px',
        overflow: 'hidden',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)'
      }}>
        {/* Header with minimize button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 15px',
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          color: '#000',
          fontWeight: 'bold'
        }}>
          <span>🏏 Cricket Controls</span>
          <button 
            onClick={() => setIsMinimized(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#000',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '2px 6px',
              borderRadius: '3px',
              background: 'rgba(0,0,0,0.1)'
            }}
          >
            ─
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.8)',
          borderBottom: '1px solid #333'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '10px 5px',
                background: activeTab === tab.id ? '#FFD700' : 'transparent',
                color: activeTab === tab.id ? '#000' : '#FFD700',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              <div>{tab.label}</div>
              <div style={{ fontSize: '9px' }}>{tab.title}</div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: '15px', maxHeight: '400px', overflowY: 'auto' }}>
          {activeTab === 'config' && (
            <div>
              <button 
                onClick={loadFromAnalysis}
                style={{
                  width: '100%',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}
              >
                🎯 Load Pitch Analysis Data
              </button>

              <div style={{ display: 'grid', gap: '10px' }}>
                {[
                  { key: 'velocity', label: 'Velocity (km/h)', step: '1' },
                  { key: 'ball_axis_x', label: 'Ball Axis X', step: '1' },
                  { key: 'ball_axis_y', label: 'Ball Axis Y', step: '1' },
                  { key: 'length_axis_x', label: 'Length Axis X', step: '1' },
                  { key: 'length_axis_z', label: 'Length Axis Z', step: '1' },
                  { key: 'line_axis_x', label: 'Line Axis X', step: '1' },
                  { key: 'line_axis_z', label: 'Line Axis Z', step: '1' }
                ].map(field => (
                  <div key={field.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ flex: 1, fontSize: '10px' }}>{field.label}:</label>
                    <input
                      type="number"
                      step={field.step}
                      value={bowlingControls[field.key]}
                      onChange={(e) => handleUpdate(field.key, e.target.value)}
                      style={{
                        width: '70px',
                        padding: '4px',
                        border: '1px solid #333',
                        borderRadius: '3px',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        fontSize: '10px'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'xyz' && (
            <DirectCoordinateControls 
              bowlingControls={bowlingControls}
              onUpdate={onBowlingConfigUpdate}
            />
          )}

          {activeTab === 'analysis' && (
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ 
                background: 'rgba(255,215,0,0.1)', 
                padding: '8px', 
                borderRadius: '4px',
                border: '1px solid #FFD700'
              }}>
                <div style={{ fontWeight: 'bold', color: '#FFD700', marginBottom: '4px' }}>
                  🎯 Current Delivery
                </div>
                <div>Velocity: {bowlingControls.velocity} km/h</div>
                <div>Flight Time: {trajectory.metadata.totalTime.toFixed(2)}s</div>
              </div>

              <div style={{ 
                background: 'rgba(68,255,68,0.1)', 
                padding: '8px', 
                borderRadius: '4px',
                border: '1px solid #44FF44'
              }}>
                <div style={{ fontWeight: 'bold', color: '#44FF44', marginBottom: '4px' }}>
                  📊 Trajectory Points
                </div>
                <div style={{ fontSize: '10px', display: 'grid', gap: '2px' }}>
                  <div>🔵 Release: ({trajectory.initial.position[0].toFixed(1)}, {trajectory.initial.position[2].toFixed(1)})</div>
                  <div>🔴 Bounce: ({trajectory.bounce.position[0].toFixed(1)}, {trajectory.bounce.position[2].toFixed(1)})</div>
                  <div>🟢 Final: ({trajectory.target.position[0].toFixed(1)}, {trajectory.target.position[2].toFixed(1)})</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'coordinates' && (
            <div style={{ display: 'grid', gap: '8px', fontSize: '10px' }}>
              {[
                { label: '🚀 Release', pos: trajectory.initial.position, color: '#0066FF' },
                { label: '⚡ Bounce', pos: trajectory.bounce.position, color: '#FF4444' },
                { label: '🎯 Final', pos: trajectory.target.position, color: '#44FF44' }
              ].map((point, i) => (
                <div key={i} style={{ 
                  padding: '6px', 
                  background: `${point.color}20`, 
                  border: `1px solid ${point.color}`,
                  borderRadius: '4px'
                }}>
                  <div style={{ fontWeight: 'bold', color: point.color, marginBottom: '2px' }}>
                    {point.label}
                  </div>
                  <div>X: {point.pos[0].toFixed(2)}m</div>
                  <div>Y: {point.pos[1].toFixed(2)}m</div>
                  <div>Z: {point.pos[2].toFixed(2)}m</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'camera' && (
            <CameraControlsDisabled 
              currentView={currentCameraView}
              onViewChange={onCameraViewChange}
            />
          )}

          {activeTab === 'guides' && (
            <div style={{ display: 'grid', gap: '10px' }}>
              {[
                { 
                  checked: showPitchMarkers, 
                  onChange: setShowPitchMarkers, 
                  label: '🔵🔴🟢 Position Markers' 
                },
                { 
                  checked: showCoordinateDisplay, 
                  onChange: setShowCoordinateDisplay, 
                  label: '📊 Coordinate Panel' 
                },
                { 
                  checked: showPitchGrid, 
                  onChange: setShowPitchGrid, 
                  label: '📏 Pitch Grid' 
                }
              ].map((guide, i) => (
                <label key={i} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer', 
                  gap: '8px',
                  padding: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '4px'
                }}>
                  <input
                    type="checkbox"
                    checked={guide.checked}
                    onChange={(e) => guide.onChange(e.target.checked)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <span style={{ fontSize: '11px' }}>{guide.label}</span>
                </label>
              ))}

              <div style={{ 
                marginTop: '8px', 
                padding: '6px',
                background: 'rgba(170,68,255,0.1)',
                borderRadius: '4px',
                fontSize: '9px',
                color: '#ccc',
                border: '1px solid #AA44FF'
              }}>
                <div style={{ color: '#AA44FF', fontWeight: 'bold', marginBottom: '2px' }}>
                  Legend:
                </div>
                <div>🔵 Release • 🔴 Bounce • 🟢 Final</div>
                <div>📏 Grid = 5m spacing</div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default CompactAccordion;
